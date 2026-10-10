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
    "japanese": _uns("photo-1635379511574-bc167ca085c8"),
    "mexican": _uns("photo-1613409385222-3d0decb6742a"),
    "chinese": _uns("photo-1504669221159-56caf7b07f57"),
    "thai": _uns("photo-1637806931098-af30b519be53"),
    "korean": _uns("photo-1600289031464-74d374b64991"),
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

    "California Roll": "https://pd.w.org/2025/03/96267d2dd62ce76c1.21462883-1536x1152.jpg",
    "Chicken Katsu": _uns("photo-1569050467447-ce54b3bbc37d"),
    "Tonkotsu Ramen": IMG["japanese"],
    "Spicy Tuna Roll": _uns("photo-1712725214706-e564b8dd1bbe"),
    "Gyoza (6pc)": _uns("photo-1768326119773-05cae29f4106"),

    "Carne Asada Tacos (3)": IMG["mexican"],
    "Chicken Quesadilla": _uns("photo-1719957770167-bb66133ba808"),
    "Guacamole & Chips": _uns("photo-1464219222984-216ebffaaf85"),
    "Burrito Bowl": _uns("photo-1658346368601-869ae3ded6d1"),
    "Elote": _uns("photo-1653886764092-2e9fe9bfe8e5"),

    "Kung Pao Chicken": _uns("photo-1767974877206-a594e0b1008e"),
    "Vegetable Fried Rice": _uns("photo-1619221881739-40de2afeaa7d"),
    "Orange Chicken": _uns("photo-1747628857852-2ffef1e3d06b"),
    "Pork Dumplings (8)": IMG["chinese"],
    "Hot and Sour Soup": _uns("photo-1652088079703-38f4a8d6b981"),

    "Pad Thai": IMG["thai"],
    "Green Curry Chicken": _uns("photo-1521633138793-76551d05e2a3"),
    "Tom Yum Soup": _uns("photo-1562565652-a0d8f0c59eb4"),
    "Mango Sticky Rice": _uns("photo-1550825570-659f94cc3a9c"),
    "Thai Spring Rolls": _uns("photo-1623253083987-26681ce4a992"),

    "Bibimbap": IMG["korean"],
    "Bulgogi Beef": _uns("photo-1709433420601-6e473136571b"),
    "Kimchi Fried Rice": _uns("photo-1698489857683-0d30f7f046f7"),
    "Korean Fried Chicken": _uns("photo-1608039755401-742074f0548d"),
    "Japchae": _uns("photo-1464500650248-1a4b45debb9f"),
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
    {
        "owner": {"name": "Kenji Watanabe", "email": "kenji@freshroute.demo"},
        "name": "Sakura Sushi & Ramen", "cuisine": "Japanese",
        "lat": 42.3196, "lng": -83.0157,  # Walkerville
        "image_url": IMG["japanese"],
        "menu": [
            ("California Roll", "Crab, avocado, cucumber, sesame, nori", 899),
            ("Chicken Katsu", "Panko-breaded cutlet, tonkatsu sauce, rice", 1499),
            ("Tonkotsu Ramen", "Pork belly, soft egg, scallion, rich pork broth", 1599),
            ("Spicy Tuna Roll", "Tuna, sriracha mayo, cucumber, nori", 999),
            ("Gyoza (6pc)", "Pan-seared pork dumplings, ponzu dipping sauce", 799),
        ],
    },
    {
        "owner": {"name": "Sofia Reyes", "email": "sofia@freshroute.demo"},
        "name": "El Mercado Taqueria", "cuisine": "Mexican",
        "lat": 42.3055, "lng": -83.0665,  # near the university
        "image_url": IMG["mexican"],
        "menu": [
            ("Carne Asada Tacos (3)", "Grilled steak, onion, cilantro, lime, corn tortilla", 1199),
            ("Chicken Quesadilla", "Grilled chicken, melted cheese, flour tortilla", 1099),
            ("Guacamole & Chips", "Fresh avocado, lime, pico de gallo, tortilla chips", 799),
            ("Burrito Bowl", "Rice, black beans, choice of protein, salsa, sour cream", 1299),
            ("Elote", "Grilled corn, chili-lime mayo, cotija cheese", 599),
        ],
    },
    {
        "owner": {"name": "Wei Chen", "email": "wei@freshroute.demo"},
        "name": "Golden Wok", "cuisine": "Chinese",
        "lat": 42.3080, "lng": -82.9850,  # Forest Glade
        "image_url": IMG["chinese"],
        "menu": [
            ("Kung Pao Chicken", "Chicken, peanuts, dried chili, Sichuan peppercorn", 1399),
            ("Vegetable Fried Rice", "Wok-fried rice, egg, mixed vegetables", 999),
            ("Orange Chicken", "Crispy chicken, sweet-tangy orange glaze", 1399),
            ("Pork Dumplings (8)", "Pan-fried pork and chive dumplings, soy dip", 899),
            ("Hot and Sour Soup", "Tofu, mushroom, bamboo shoot, white pepper", 699),
        ],
    },
    {
        "owner": {"name": "Anong Suwan", "email": "anong@freshroute.demo"},
        "name": "Bangkok Basil", "cuisine": "Thai",
        "lat": 42.2975, "lng": -82.9775,  # near Devonshire Mall
        "image_url": IMG["thai"],
        "menu": [
            ("Pad Thai", "Rice noodles, egg, bean sprouts, peanuts, tamarind", 1299),
            ("Green Curry Chicken", "Coconut milk, Thai basil, bamboo shoots, chili", 1499),
            ("Tom Yum Soup", "Lemongrass, lime leaf, mushroom, shrimp", 999),
            ("Mango Sticky Rice", "Coconut sticky rice, fresh mango", 699),
            ("Thai Spring Rolls", "Crispy vegetable rolls, sweet chili sauce", 699),
        ],
    },
    {
        "owner": {"name": "Min-jun Park", "email": "minjun@freshroute.demo"},
        "name": "Seoul Garden", "cuisine": "Korean",
        "lat": 42.2850, "lng": -83.0100,  # south Windsor
        "image_url": IMG["korean"],
        "menu": [
            ("Bibimbap", "Mixed rice, vegetables, gochujang, fried egg", 1399),
            ("Bulgogi Beef", "Marinated grilled beef, rice, scallion", 1599),
            ("Kimchi Fried Rice", "Kimchi, rice, fried egg, scallion, sesame", 1199),
            ("Korean Fried Chicken", "Double-fried chicken, sweet-spicy glaze", 1399),
            ("Japchae", "Stir-fried glass noodles, vegetables, beef", 1199),
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
