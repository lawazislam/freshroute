"""FreshRoute API: a role-based food delivery platform.

Three roles share one system: customer, restaurant_owner, rider. Each
role has a genuinely different set of permitted actions, enforced by
state_machine.py and the per-role checks in these endpoints, not just a
different frontend skin on the same open API.
"""
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from datetime import datetime

from . import models, auth, pricing, state_machine, seed
from .database import init_db, get_conn

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed.run()  # calls init_db() internally, then seeds only if the DB is empty
    yield


app = FastAPI(title="FreshRoute API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- auth dependency ----------

def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header.")
    token = authorization.removeprefix("Bearer ").strip()
    user_id = auth.resolve_session(token)
    if user_id is None:
        raise HTTPException(401, "Session expired or invalid. Please log in again.")
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(401, "User no longer exists.")
    return row


def require_role(user, *allowed: str):
    if user["role"] not in allowed:
        raise HTTPException(403, f"This action requires one of: {', '.join(allowed)}.")


# ---------- auth endpoints ----------

@app.post("/api/auth/register", response_model=models.UserOut, status_code=201)
def register(payload: models.UserCreate):
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        if existing:
            raise HTTPException(409, "An account with this email already exists.")
        cur = conn.execute(
            "INSERT INTO users (name, email, password_hash, role, lat, lng) VALUES (?,?,?,?,?,?)",
            (payload.name, payload.email, auth.hash_password(payload.password),
             payload.role, payload.lat, payload.lng),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.post("/api/auth/login")
def login(payload: models.UserLogin):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    if row is None or not auth.verify_password(payload.password, row["password_hash"]):
        raise HTTPException(401, "Incorrect email or password.")
    token = auth.create_session(row["id"])
    return {"token": token, "user": dict(row)}


@app.get("/api/auth/me", response_model=models.UserOut)
def me(user=Depends(get_current_user)):
    return dict(user)


# ---------- restaurant endpoints ----------

@app.post("/api/restaurants", response_model=models.RestaurantOut, status_code=201)
def create_restaurant(payload: models.RestaurantCreate, user=Depends(get_current_user)):
    require_role(user, "restaurant_owner")
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO restaurants (owner_id, name, cuisine, lat, lng, image_url) VALUES (?,?,?,?,?,?)",
            (user["id"], payload.name, payload.cuisine, payload.lat, payload.lng, payload.image_url),
        )
        row = conn.execute("SELECT * FROM restaurants WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.get("/api/restaurants", response_model=list[models.RestaurantOut])
def list_restaurants():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM restaurants ORDER BY name").fetchall()
    return [dict(r) for r in rows]


@app.get("/api/restaurants/{restaurant_id}/menu", response_model=list[models.MenuItemOut])
def get_menu(restaurant_id: int):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY name", (restaurant_id,)
        ).fetchall()
    return [dict(r) for r in rows]


@app.post("/api/restaurants/{restaurant_id}/menu", response_model=models.MenuItemOut, status_code=201)
def add_menu_item(restaurant_id: int, payload: models.MenuItemCreate, user=Depends(get_current_user)):
    require_role(user, "restaurant_owner")
    with get_conn() as conn:
        restaurant = conn.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,)).fetchone()
        if restaurant is None:
            raise HTTPException(404, "Restaurant not found.")
        if restaurant["owner_id"] != user["id"]:
            raise HTTPException(403, "You can only add menu items to your own restaurant.")
        cur = conn.execute(
            "INSERT INTO menu_items (restaurant_id, name, description, price_cents, available, image_url) "
            "VALUES (?,?,?,?,?,?)",
            (restaurant_id, payload.name, payload.description, payload.price_cents,
             int(payload.available), payload.image_url),
        )
        row = conn.execute("SELECT * FROM menu_items WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.patch("/api/menu-items/{item_id}", response_model=models.MenuItemOut)
def update_menu_item(item_id: int, payload: models.MenuItemCreate, user=Depends(get_current_user)):
    require_role(user, "restaurant_owner")
    with get_conn() as conn:
        item = conn.execute(
            "SELECT menu_items.*, restaurants.owner_id AS owner_id FROM menu_items "
            "JOIN restaurants ON restaurants.id = menu_items.restaurant_id WHERE menu_items.id = ?",
            (item_id,),
        ).fetchone()
        if item is None:
            raise HTTPException(404, "Menu item not found.")
        if item["owner_id"] != user["id"]:
            raise HTTPException(403, "You can only edit items on your own restaurant's menu.")
        conn.execute(
            "UPDATE menu_items SET name=?, description=?, price_cents=?, available=?, image_url=? WHERE id=?",
            (payload.name, payload.description, payload.price_cents, int(payload.available),
             payload.image_url, item_id),
        )
        row = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,)).fetchone()
    return dict(row)


# ---------- order endpoints ----------

def _order_to_out(conn, order_row) -> dict:
    items = conn.execute(
        "SELECT menu_item_id, name, quantity, unit_price_cents, image_url FROM order_items WHERE order_id = ?",
        (order_row["id"],),
    ).fetchall()
    restaurant = conn.execute(
        "SELECT name FROM restaurants WHERE id = ?", (order_row["restaurant_id"],)
    ).fetchone()
    d = dict(order_row)
    d["restaurant_name"] = restaurant["name"] if restaurant else "Unknown"
    d["items"] = [dict(i) for i in items]
    return d


@app.post("/api/orders", response_model=models.OrderOut, status_code=201)
def place_order(payload: models.OrderCreate, user=Depends(get_current_user)):
    require_role(user, "customer")
    with get_conn() as conn:
        restaurant = conn.execute(
            "SELECT * FROM restaurants WHERE id = ?", (payload.restaurant_id,)
        ).fetchone()
        if restaurant is None:
            raise HTTPException(404, "Restaurant not found.")

        subtotal = 0
        resolved_items = []
        for line in payload.items:
            item = conn.execute(
                "SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?",
                (line.menu_item_id, payload.restaurant_id),
            ).fetchone()
            if item is None:
                raise HTTPException(400, f"Menu item {line.menu_item_id} does not belong to this restaurant.")
            if not item["available"]:
                raise HTTPException(400, f"'{item['name']}' is currently unavailable.")
            subtotal += item["price_cents"] * line.quantity
            resolved_items.append((item["id"], item["name"], line.quantity, item["price_cents"], item["image_url"]))

        distance = pricing.haversine_km(
            restaurant["lat"], restaurant["lng"], payload.delivery_lat, payload.delivery_lng
        )
        if not pricing.is_within_delivery_range(distance):
            raise HTTPException(
                400,
                f"This address is {distance:.1f} km from the restaurant, outside the "
                f"{pricing.MAX_DELIVERY_KM:.0f} km delivery range.",
            )
        fee = pricing.delivery_fee_cents(distance)
        total = subtotal + fee

        cur = conn.execute(
            "INSERT INTO orders (customer_id, restaurant_id, status, subtotal_cents, delivery_fee_cents, "
            "total_cents, distance_km, delivery_lat, delivery_lng) VALUES (?,?,?,?,?,?,?,?,?)",
            (user["id"], payload.restaurant_id, "placed", subtotal, fee, total,
             round(distance, 2), payload.delivery_lat, payload.delivery_lng),
        )
        order_id = cur.lastrowid
        for menu_item_id, name, qty, unit_price, image_url in resolved_items:
            conn.execute(
                "INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price_cents, image_url) "
                "VALUES (?,?,?,?,?,?)",
                (order_id, menu_item_id, name, qty, unit_price, image_url),
            )
        conn.execute(
            "INSERT INTO order_status_events (order_id, status) VALUES (?,?)", (order_id, "placed")
        )
        order_row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        result = _order_to_out(conn, order_row)
    return result


@app.get("/api/orders", response_model=list[models.OrderOut])
def list_orders(user=Depends(get_current_user)):
    with get_conn() as conn:
        if user["role"] == "customer":
            rows = conn.execute(
                "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", (user["id"],)
            ).fetchall()
        elif user["role"] == "restaurant_owner":
            rows = conn.execute(
                "SELECT orders.* FROM orders JOIN restaurants ON restaurants.id = orders.restaurant_id "
                "WHERE restaurants.owner_id = ? ORDER BY orders.created_at DESC",
                (user["id"],),
            ).fetchall()
        else:  # rider: orders ready to claim (preparing, unclaimed) or already theirs
            rows = conn.execute(
                "SELECT * FROM orders WHERE (status = 'preparing' AND rider_id IS NULL) "
                "OR rider_id = ? ORDER BY created_at DESC",
                (user["id"],),
            ).fetchall()
        result = [_order_to_out(conn, r) for r in rows]
    return result


@app.get("/api/orders/{order_id}", response_model=models.OrderOut)
def get_order(order_id: int, user=Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Order not found.")
        _assert_can_view_order(conn, row, user)
        result = _order_to_out(conn, row)
    return result


def _assert_can_view_order(conn, order_row, user):
    if user["role"] == "customer" and order_row["customer_id"] == user["id"]:
        return
    if user["role"] == "rider" and (order_row["rider_id"] == user["id"] or order_row["rider_id"] is None):
        return
    if user["role"] == "restaurant_owner":
        restaurant = conn.execute(
            "SELECT owner_id FROM restaurants WHERE id = ?", (order_row["restaurant_id"],)
        ).fetchone()
        if restaurant and restaurant["owner_id"] == user["id"]:
            return
    raise HTTPException(403, "You don't have access to this order.")


@app.post("/api/orders/{order_id}/claim", response_model=models.OrderOut)
def claim_order(order_id: int, user=Depends(get_current_user)):
    require_role(user, "rider")
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Order not found.")
        if row["status"] != "preparing":
            raise HTTPException(400, "Only orders that are being prepared can be claimed.")
        if row["rider_id"] is not None:
            raise HTTPException(409, "This order has already been claimed by another rider.")
        conn.execute("UPDATE orders SET rider_id = ? WHERE id = ?", (user["id"], order_id))
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        result = _order_to_out(conn, row)
    return result


@app.patch("/api/orders/{order_id}/status", response_model=models.OrderOut)
def update_status(order_id: int, payload: models.StatusUpdate, user=Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Order not found.")

        if user["role"] == "restaurant_owner":
            restaurant = conn.execute(
                "SELECT owner_id FROM restaurants WHERE id = ?", (row["restaurant_id"],)
            ).fetchone()
            if not restaurant or restaurant["owner_id"] != user["id"]:
                raise HTTPException(403, "This isn't your restaurant's order.")
        elif user["role"] == "rider":
            if row["rider_id"] != user["id"]:
                raise HTTPException(403, "You haven't claimed this order.")
        else:
            raise HTTPException(403, "Customers cannot change order status.")

        try:
            state_machine.check_transition(row["status"], payload.status, user["role"])
        except state_machine.InvalidTransition as e:
            raise HTTPException(400, str(e))
        except state_machine.NotAuthorizedForTransition as e:
            raise HTTPException(403, str(e))

        conn.execute("UPDATE orders SET status = ? WHERE id = ?", (payload.status, order_id))
        conn.execute(
            "INSERT INTO order_status_events (order_id, status) VALUES (?,?)", (order_id, payload.status)
        )
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        result = _order_to_out(conn, row)
    return result


@app.get("/api/orders/{order_id}/history")
def order_history(order_id: int, user=Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Order not found.")
        _assert_can_view_order(conn, row, user)
        events = conn.execute(
            "SELECT status, changed_at FROM order_status_events WHERE order_id = ? ORDER BY changed_at",
            (order_id,),
        ).fetchall()
    return [dict(e) for e in events]


# ---------- restaurant analytics ----------

@app.get("/api/restaurants/{restaurant_id}/analytics")
def restaurant_analytics(restaurant_id: int, user=Depends(get_current_user)):
    require_role(user, "restaurant_owner")
    with get_conn() as conn:
        restaurant = conn.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,)).fetchone()
        if restaurant is None:
            raise HTTPException(404, "Restaurant not found.")
        if restaurant["owner_id"] != user["id"]:
            raise HTTPException(403, "You can only view analytics for your own restaurant.")

        top_items = conn.execute(
            "SELECT order_items.name, SUM(order_items.quantity) AS units_sold, "
            "SUM(order_items.quantity * order_items.unit_price_cents) AS revenue_cents "
            "FROM order_items JOIN orders ON orders.id = order_items.order_id "
            "WHERE orders.restaurant_id = ? AND orders.status != 'cancelled' "
            "GROUP BY order_items.name ORDER BY units_sold DESC LIMIT 10",
            (restaurant_id,),
        ).fetchall()

        daily_orders = conn.execute(
            "SELECT date(created_at) AS day, COUNT(*) AS order_count, "
            "SUM(total_cents) AS revenue_cents "
            "FROM orders WHERE restaurant_id = ? AND status != 'cancelled' "
            "GROUP BY date(created_at) ORDER BY day",
            (restaurant_id,),
        ).fetchall()

        totals = conn.execute(
            "SELECT COUNT(*) AS total_orders, "
            "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders, "
            "SUM(CASE WHEN status != 'cancelled' THEN total_cents ELSE 0 END) AS total_revenue_cents "
            "FROM orders WHERE restaurant_id = ?",
            (restaurant_id,),
        ).fetchone()

    return {
        "top_items": [dict(r) for r in top_items],
        "daily_orders": [dict(r) for r in daily_orders],
        "totals": dict(totals),
    }


# ---------- serve the built frontend (single-service deployment) ----------
# Mounted after every /api/ route above, so API paths are always matched
# first. Anything else falls back to the SPA's index.html, which is what
# lets client-side routes like /restaurants/3 or /orders/12 work correctly
# on a direct browser load or refresh, not just on in-app navigation.
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/favicon.svg")
    def favicon():
        return FileResponse(FRONTEND_DIST / "favicon.svg")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(FRONTEND_DIST / "index.html")
