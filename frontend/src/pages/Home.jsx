import { Link } from "react-router-dom";

// The ten restaurant hero photos already verified for the restaurant
// cards, reused here so the hero shows real menu photography instead of
// an invented "Windsor street" scene that doesn't exist for a fictional
// set of restaurants.
const CUISINES = [
  {
    name: "Italian",
    blurb: "Rosa's Trattoria",
    image: "https://images.unsplash.com/photo-1673442635965-34f1b36d8944?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Vietnamese",
    blurb: "Saigon Street Kitchen",
    image: "https://images.unsplash.com/photo-1463424625195-3776f3c34a6b?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Indian",
    blurb: "Spice Route Indian Kitchen",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "American",
    blurb: "Riverside Burger Co.",
    image: "https://images.unsplash.com/photo-1560971017-e22e6a4fbefd?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Mediterranean Grill",
    blurb: "Windsor Kebab & Grill",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Japanese",
    blurb: "Sakura Sushi & Ramen",
    image: "https://images.unsplash.com/photo-1635379511574-bc167ca085c8?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Mexican",
    blurb: "El Mercado Taqueria",
    image: "https://images.unsplash.com/photo-1613409385222-3d0decb6742a?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Chinese",
    blurb: "Golden Wok",
    image: "https://images.unsplash.com/photo-1504669221159-56caf7b07f57?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Thai",
    blurb: "Bangkok Basil",
    image: "https://images.unsplash.com/photo-1637806931098-af30b519be53?w=500&q=75&auto=format&fit=crop",
  },
  {
    name: "Korean",
    blurb: "Seoul Garden",
    image: "https://images.unsplash.com/photo-1600289031464-74d374b64991?w=500&q=75&auto=format&fit=crop",
  },
];

const STEPS = [
  {
    title: "Place your order",
    text: "Pick a restaurant, add items to your cart, and check out.",
  },
  {
    title: "The kitchen prepares it",
    text: "The restaurant confirms your order and starts cooking.",
  },
  {
    title: "A rider delivers it",
    text: "Track the order in real time until it reaches your door.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="home-hero">
        <div className="home-hero-panel">
          <h1 className="home-hero-title">Ten kitchens.<br />One delivery.</h1>
          <p className="home-hero-sub">
            From Italian to Korean, Mexican to Mediterranean, every
            restaurant ships through one cart with one delivery fee based
            on distance.
          </p>
          <div className="home-hero-ctas">
            <Link to="/register" className="btn-primary">
              Create an account
            </Link>
            <Link to="/login" className="btn-ghost" style={{ background: "transparent", color: "var(--paper)", borderColor: "rgba(247,243,237,0.35)" }}>
              Log in
            </Link>
          </div>
        </div>
        <div className="home-hero-mosaic" aria-hidden="true">
          {CUISINES.map((c) => (
            <img key={c.name} src={c.image} alt="" loading="eager" />
          ))}
        </div>
      </section>

      <section className="container home-section">
        <h2>Pick a kitchen</h2>
        <p className="muted" style={{ marginTop: "-0.3em" }}>Full menus are available once you're signed in.</p>
        <div className="restaurant-grid">
          {CUISINES.map((c) => (
            <Link key={c.name} to="/register" className="restaurant-card-link" aria-label={`Sign up to order ${c.name} food from ${c.blurb}`}>
              <div className="restaurant-card">
                <div className="restaurant-card-image-wrap">
                  <img src={c.image} alt={`A dish from ${c.blurb}, a ${c.name} restaurant`} className="restaurant-card-image" loading="lazy" />
                </div>
                <div className="restaurant-card-body">
                  <h3>{c.blurb}</h3>
                  <p className="muted" style={{ margin: 0 }}>{c.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <h2>From order to doorstep</h2>
        <div className="home-steps">
          {STEPS.map((step, i) => (
            <div className="home-step" key={step.title}>
              <span className="home-step-number">{i + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container home-section" style={{ paddingBottom: "1rem" }}>
        <p className="muted" style={{ fontSize: "0.88rem" }}>
          FreshRoute is a portfolio project, not a real delivery service.{" "}
          <Link to="/about" style={{ textDecoration: "underline" }}>See what that means.</Link>
        </p>
      </section>
    </div>
  );
}
