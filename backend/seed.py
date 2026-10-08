"""Seed script: realistic demo data so a fresh deploy isn't empty.

All coordinates are real Windsor, ON locations so the distance/delivery-fee
math produces sensible, varied results rather than identical or zero
distances. Demo account passwords are intentionally simple and clearly
labeled as demo credentials, not meant to be secure.
"""
from .database import init_db, get_conn
from . import auth

DEMO_PASSWORD = "demo1234"

# Unsplash CDN, hotlinked directly (allowed under the Unsplash License).
# Each one verified individually on unsplash.com for both license status
# and that it actually depicts the dish it's used for, not just "close
# enough" stock food photography.
IMG = {
    "italian": "https://images.unsplash.com/photo-1673442635965-34f1b36d8944?w=800&q=75&auto=format&fit=crop",
    "vietnamese": "https://images.unsplash.com/photo-1463424625195-3776f3c34a6b?w=800&q=75&auto=format&fit=crop",
    "indian": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=75&auto=format&fit=crop",
    "american": "https://images.unsplash.com/photo-1560971017-e22e6a4fbefd?w=800&q=75&auto=format&fit=crop",
    "mediterranean": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75&auto=format&fit=crop",
}

RESTAURANTS = [
    {
        "owner": {"name": "Rosa Delgado", "email": "rosa@freshroute.demo"},
        "name": "Rosa's Trattoria", "cuisine": "Italian",
        "lat": 42.3149, "lng": -83.0364,  # downtown Windsor
        "image_url": IMG["italian"],
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
        "image_url": IMG["vietnamese"],
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
        "image_url": IMG["indian"],
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
        "image_url": IMG["american"],
        "menu": [
            ("Classic Cheeseburger", "Smashed patty, cheddar, pickles, house sauce", 1199),
            ("Bacon BBQ Burger", "Applewood bacon, smoked gouda, onion rings", 1499),
            ("Loaded Fries", "Cheese curds, gravy, green onion", 899),
            ("Crispy Chicken Sandwich", "Buttermilk-fried, slaw, spicy mayo", 1299),
            ("Milkshake", "Vanilla, chocolate, or strawberry", 699),
        ],
    },
    {
        "owner": {"name": "Omar Haddad", "email": "omar@freshroute.demo"},
        "name": "Windsor Kebab & Grill", "cuisine": "Mediterranean Grill",
        "lat": 42.3215, "lng": -83.0201,  # east side
        "image_url": IMG["mediterranean"],
        "menu": [
            ("Mixed Grill Platter", "Chicken, beef kebab and lamb skewers, grilled over open flame", 1899),
            ("Chicken Shawarma Wrap", "Marinated chicken, garlic sauce, pickles, warm pita", 1199),
            ("Falafel Plate", "House-made falafel, hummus, tabbouleh, warm pita", 1399),
            ("Grilled Vegetable Skewer", "Peppers, zucchini, onion, char-grilled", 999),
            ("Baklava", "Layered filo pastry, honey, crushed pistachio", 599),
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
                "INSERT INTO restaurants (owner_id, name, cuisine, lat, lng, image_url) VALUES (?,?,?,?,?,?)",
                (owner_id, r["name"], r["cuisine"], r["lat"], r["lng"], r.get("image_url")),
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
