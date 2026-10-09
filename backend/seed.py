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
def _uns(photo_id):
    return f"https://images.unsplash.com/{photo_id}?w=800&q=75&auto=format&fit=crop"


IMG = {
    "italian": _uns("photo-1673442635965-34f1b36d8944"),
    "vietnamese": _uns("photo-1463424625195-3776f3c34a6b"),
    "indian": _uns("photo-1630383249896-424e482df921"),
    "american": _uns("photo-1560971017-e22e6a4fbefd"),
    "mediterranean": _uns("photo-1555939594-58d7cb561ad1"),
}

# Per-item photos. Same standard as the restaurant hero images: each
# verified individually for license and that it actually depicts the dish
# (or, where no exact free match existed for a specific named dish, the
# closest genuinely relevant real photo, e.g. a plain green salad standing
# in for Caesar Salad). Two non-Unsplash sources are used where they had
# the best match: WordPress Photo Directory (CC0, pd.w.org) and Foodiesfeed
# (CC0, real photographer credited, not their AI-Studio content).
ITEM_IMG = {
    "Margherita Pizza": _uns("photo-1595026506669-1e937fc6b9e6"),
    "Spaghetti Carbonara": _uns("photo-1633337474564-1d9478ca4e2e"),
    "Caesar Salad": _uns("photo-1472926373053-51b220987527"),
    "Tiramisu": "https://pd.w.org/2026/06/9176a28f64b16c556.84065501-1536x1024.jpg",
    "Garlic Bread": _uns("photo-1532038331778-7f22c2594ec1"),

    "Pho Bo": _uns("photo-1701480253822-1842236c9a97"),
    "Banh Mi": IMG["vietnamese"],
    "Fresh Spring Rolls": (
        "https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/"
        "vietnamese-spring-rolls-on-a-table-apfdyk8Qd6-lA8OijrRJd.jpg"
    ),
    "Vermicelli Bowl": _uns("photo-1463424591693-a7c7ed4e3342"),
    "Vietnamese Iced Coffee": _uns("photo-1502599213010-875782f9bf52"),

    "Butter Chicken": IMG["indian"],
    "Chana Masala": IMG["indian"],
    "Garlic Naan": _uns("photo-1566698629409-787a68fc5724"),
    "Vegetable Samosas (3)": _uns("photo-1747008624832-e068ee496908"),
    "Mango Lassi": _uns("photo-1606943932434-2f21e1c54ef2"),

    "Classic Cheeseburger": IMG["american"],
    "Bacon BBQ Burger": _uns("photo-1553979459-d2229ba7433b"),
    "Loaded Fries": _uns("photo-1485962398705-ef6a13c41e8f"),
    "Crispy Chicken Sandwich": _uns("photo-1670710029403-607db8eeec83"),
    "Milkshake": _uns("photo-1596151163116-98a5033814c2"),

    "Mixed Grill Platter": IMG["mediterranean"],
    "Chicken Shawarma Wrap": "https://pd.w.org/2026/06/7986a25dbcc328bd6.11262203-1536x1152.jpg",
    "Falafel Plate": _uns("photo-1718801594202-87766a1d5ce5"),
    "Grilled Vegetable Skewer": _uns("photo-1461530927168-44328109da52"),
    "Baklava": _uns("photo-1658413380634-e127bbaeeb7b"),
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
                    "INSERT INTO menu_items "
                    "(restaurant_id, name, description, price_cents, available, image_url) "
                    "VALUES (?,?,?,?,1,?)",
                    (restaurant_id, name, desc, price, ITEM_IMG.get(name)),
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
