"""End-to-end API tests for FreshRoute, run against an isolated temp database."""
import os
import tempfile
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch):
    """Fresh isolated SQLite file per test, so tests never interfere."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.environ["FRESHROUTE_DB_PATH"] = path
    import importlib
    from backend import database
    importlib.reload(database)
    database.DB_PATH = path
    from backend import app as app_module
    importlib.reload(app_module)
    database.init_db()
    yield TestClient(app_module.app)
    os.remove(path)


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def register_and_login(client, name, email, role, **extra):
    client.post("/api/auth/register", json={
        "name": name, "email": email, "password": "password123", "role": role, **extra
    })
    r = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    return r.json()["token"]


def test_registration_and_duplicate_email(client):
    r = client.post("/api/auth/register", json={
        "name": "A", "email": "a@example.com", "password": "password123", "role": "customer"
    })
    assert r.status_code == 201
    dup = client.post("/api/auth/register", json={
        "name": "A2", "email": "a@example.com", "password": "password123", "role": "customer"
    })
    assert dup.status_code == 409


def test_login_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "name": "A", "email": "a@example.com", "password": "password123", "role": "customer"
    })
    r = client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_full_order_lifecycle(client):
    cust = register_and_login(client, "Casey", "casey@x.com", "customer", lat=42.3149, lng=-83.0364)
    owner = register_and_login(client, "Rosa", "rosa@x.com", "restaurant_owner")
    rider = register_and_login(client, "Remy", "remy@x.com", "rider")

    rest = client.post("/api/restaurants", json={
        "name": "Rosa's Kitchen", "cuisine": "Italian", "lat": 42.3300, "lng": -83.0400
    }, headers=auth(owner))
    assert rest.status_code == 201
    restaurant_id = rest.json()["id"]

    item = client.post(f"/api/restaurants/{restaurant_id}/menu", json={
        "name": "Pizza", "description": "", "price_cents": 1000
    }, headers=auth(owner))
    assert item.status_code == 201
    item_id = item.json()["id"]

    order = client.post("/api/orders", json={
        "restaurant_id": restaurant_id,
        "items": [{"menu_item_id": item_id, "quantity": 2}],
        "delivery_lat": 42.3149, "delivery_lng": -83.0364,
    }, headers=auth(cust))
    assert order.status_code == 201
    data = order.json()
    assert data["subtotal_cents"] == 2000
    assert data["status"] == "placed"
    order_id = data["id"]

    # illegal jump
    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "delivered"},
                         headers=auth(owner)).status_code == 400

    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "confirmed"},
                         headers=auth(owner)).status_code == 200
    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "preparing"},
                         headers=auth(owner)).status_code == 200

    # customer can't change status
    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "out_for_delivery"},
                         headers=auth(cust)).status_code == 403

    claim = client.post(f"/api/orders/{order_id}/claim", headers=auth(rider))
    assert claim.status_code == 200
    assert claim.json()["rider_id"] is not None

    # restaurant no longer owns this step
    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "out_for_delivery"},
                         headers=auth(owner)).status_code == 403

    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "out_for_delivery"},
                         headers=auth(rider)).status_code == 200
    assert client.patch(f"/api/orders/{order_id}/status", json={"status": "delivered"},
                         headers=auth(rider)).status_code == 200

    hist = client.get(f"/api/orders/{order_id}/history", headers=auth(cust))
    statuses = [h["status"] for h in hist.json()]
    assert statuses == ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"]


def test_role_restrictions_on_restaurant_creation(client):
    cust = register_and_login(client, "Casey", "casey@x.com", "customer")
    r = client.post("/api/restaurants", json={
        "name": "Fake", "cuisine": "Fake", "lat": 0, "lng": 0
    }, headers=auth(cust))
    assert r.status_code == 403


def test_order_rejected_outside_delivery_range(client):
    cust = register_and_login(client, "Casey", "casey@x.com", "customer")
    owner = register_and_login(client, "Rosa", "rosa@x.com", "restaurant_owner")
    rest = client.post("/api/restaurants", json={
        "name": "Rosa's Kitchen", "cuisine": "Italian", "lat": 42.3300, "lng": -83.0400
    }, headers=auth(owner))
    restaurant_id = rest.json()["id"]
    item = client.post(f"/api/restaurants/{restaurant_id}/menu", json={
        "name": "Pizza", "description": "", "price_cents": 1000
    }, headers=auth(owner))
    item_id = item.json()["id"]

    far_order = client.post("/api/orders", json={
        "restaurant_id": restaurant_id,
        "items": [{"menu_item_id": item_id, "quantity": 1}],
        "delivery_lat": 43.6532, "delivery_lng": -79.3832,  # Toronto, far from Windsor
    }, headers=auth(cust))
    assert far_order.status_code == 400


def test_menu_item_cannot_be_edited_by_non_owner(client):
    owner1 = register_and_login(client, "Rosa", "rosa@x.com", "restaurant_owner")
    owner2 = register_and_login(client, "Sam", "sam@x.com", "restaurant_owner")
    rest = client.post("/api/restaurants", json={
        "name": "Rosa's Kitchen", "cuisine": "Italian", "lat": 42.33, "lng": -83.04
    }, headers=auth(owner1))
    restaurant_id = rest.json()["id"]
    item = client.post(f"/api/restaurants/{restaurant_id}/menu", json={
        "name": "Pizza", "description": "", "price_cents": 1000
    }, headers=auth(owner1))
    item_id = item.json()["id"]

    r = client.patch(f"/api/menu-items/{item_id}", json={
        "name": "Hacked", "description": "", "price_cents": 1, "available": True
    }, headers=auth(owner2))
    assert r.status_code == 403


def test_unclaimed_order_cannot_be_double_claimed(client):
    cust = register_and_login(client, "Casey", "casey@x.com", "customer")
    owner = register_and_login(client, "Rosa", "rosa@x.com", "restaurant_owner")
    rider1 = register_and_login(client, "Remy", "remy@x.com", "rider")
    rider2 = register_and_login(client, "Riley", "riley@x.com", "rider")

    rest = client.post("/api/restaurants", json={
        "name": "Rosa's", "cuisine": "Italian", "lat": 42.33, "lng": -83.04
    }, headers=auth(owner))
    restaurant_id = rest.json()["id"]
    item = client.post(f"/api/restaurants/{restaurant_id}/menu", json={
        "name": "Pizza", "description": "", "price_cents": 1000
    }, headers=auth(owner))
    item_id = item.json()["id"]
    order = client.post("/api/orders", json={
        "restaurant_id": restaurant_id,
        "items": [{"menu_item_id": item_id, "quantity": 1}],
        "delivery_lat": 42.3149, "delivery_lng": -83.0364,
    }, headers=auth(cust))
    order_id = order.json()["id"]
    client.patch(f"/api/orders/{order_id}/status", json={"status": "confirmed"}, headers=auth(owner))
    client.patch(f"/api/orders/{order_id}/status", json={"status": "preparing"}, headers=auth(owner))

    first_claim = client.post(f"/api/orders/{order_id}/claim", headers=auth(rider1))
    assert first_claim.status_code == 200
    second_claim = client.post(f"/api/orders/{order_id}/claim", headers=auth(rider2))
    assert second_claim.status_code == 409
