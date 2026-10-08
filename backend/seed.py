"""Seed script: realistic demo data so a fresh deploy isn't empty.

All coordinates are real Windsor, ON locations so the distance/delivery-fee
math produces sensible, varied results rather than identical or zero
distances. Demo account passwords are intentionally simple and clearly
labeled as demo credentials, not meant to be secure.
"""
from .database import init_db, get_conn
from . import auth

DEMO_PASSWORD = "demo1234"

RESTAURANTS = [
    {
        "owner": {"name": "Rosa Delgado", "email": "rosa@freshroute.demo"},
        "name": "Rosa's Trattoria", "cuisine": "Italian",
        "lat": 42.3149, "lng": -83.0364,  # downtown Windsor
        "menu": [
            ("Margherita Pizza", "San Marzano tomato, fresh mozzarella, basil", 1499),
            ("Spaghetti Carbonara", "Guanciale, pecorino, egg, black pepper", 1699),
            ("Caesar Salad", "Romaine, parmesan, housemade dressing, croutons", 1099),
            ("Tiramisu", "Espresso-soaked ladyfingers, mascarpone", 799),
            ("Garlic Bread", "Toasted baguette, roasted garlic butter", 599),
        ],
    },
    {
        "owner": {"name": "Minh Tran", "email": "minh@freshroute.demo"},
        "name": "Saigon Street Kitchen", "cuisine": "Vietnamese",
        "lat": 42.3001, "lng": -83.0298,  # a few km south
        "menu": [
            ("Pho Bo", "Beef broth, rice noodles, herbs, bean sprouts", 1399),
            ("Banh Mi", "Grilled pork, pickled daikon, cilantro, baguette", 999),
            ("Fresh Spring Rolls", "Shrimp, rice vermicelli, peanut sauce", 899),
            ("Vermicelli Bowl", "Grilled lemongrass chicken, herbs, nuoc cham", 1299),
            ("Vietnamese Iced Coffee", "Condensed milk, dark roast", 499),
        ],
    },
    {
        "owner": {"name": "Devi Shankar", "email": "devi@freshroute.demo"},
        "name": "Spice Route Indian Kitchen", "cuisine": "Indian",
        "lat": 42.3267, "lng": -83.0557,  # west side
        "menu": [
            ("Butter Chicken", "Tomato-cream curry, basmati rice", 1599),
            ("Chana Masala", "Chickpeas, tomato, onion, garam masala", 1299),
            ("Garlic Naan", "Tandoor-baked flatbread", 399),
            ("Vegetable Samosas (3)", "Spiced potato and pea, mint chutney", 699),
            ("Mango Lassi", "Yogurt, mango, cardamom", 499),
        ],
    },
    {
        "owner": {"name": "Jamie Ferreira", "email": "jamie@freshroute.demo"},
        "name": "Riverside Burger Co.", "cuisine": "American",
        "lat": 42.3094, "lng": -83.0455,  # riverside
        "menu": [
            ("Classic Cheeseburger", "Smashed patty, cheddar, pickles, house sauce", 1199),
            ("Bacon BBQ Burger", "Applewood bacon, smoked gouda, onion rings", 1499),
            ("Loaded Fries", "Cheese curds, gravy, green onion", 899),
            ("Crispy Chicken Sandwich", "Buttermilk-fried, slaw, spicy mayo", 1299),
            ("Milkshake", "Vanilla, chocolate, or strawberry", 699),
        ],
    },
]

RIDERS = [
    {"name": "Remy Okafor", "email": "remy@freshroute.demo"},
    {"name": "Priya Nair", "email": "priya@freshroute.demo"},
]

CUSTOMERS = [
    {"name": "Casey Morgan", "email": "casey@freshroute.demo", "lat": 42.3180, "lng": -83.0390},
]


def run():
    init_db()
    with get_conn() as conn:
        existing = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()["n"]
        if existing:
            print(f"Database already has {existing} users, skipping seed.")
            return

        for r in RESTAURANTS:
            cur = conn.execute(
                "INSERT INTO users (name, email, password_hash, role, lat, lng) VALUES (?,?,?,?,?,?)",
                (r["owner"]["name"], r["owner"]["email"], auth.hash_password(DEMO_PASSWORD),
                 "restaurant_owner", r["lat"], r["lng"]),
            )
            owner_id = cur.lastrowid
            rcur = conn.execute(
                "INSERT INTO restaurants (owner_id, name, cuisine, lat, lng) VALUES (?,?,?,?,?)",
                (owner_id, r["name"], r["cuisine"], r["lat"], r["lng"]),
            )
            restaurant_id = rcur.lastrowid
            for name, desc, price in r["menu"]:
                conn.execute(
                    "INSERT INTO menu_items (restaurant_id, name, description, price_cents, available) "
                    "VALUES (?,?,?,?,1)",
                    (restaurant_id, name, desc, price),
                )

        for rider in RIDERS:
            conn.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
                (rider["name"], rider["email"], auth.hash_password(DEMO_PASSWORD), "rider"),
            )

        for cust in CUSTOMERS:
            conn.execute(
                "INSERT INTO users (name, email, password_hash, role, lat, lng) VALUES (?,?,?,?,?,?)",
                (cust["name"], cust["email"], auth.hash_password(DEMO_PASSWORD),
                 "customer", cust["lat"], cust["lng"]),
            )

    print(f"Seeded {len(RESTAURANTS)} restaurants, {len(RIDERS)} riders, {len(CUSTOMERS)} customers. "
          f"Demo password for all accounts: {DEMO_PASSWORD}")


if __name__ == "__main__":
    run()
