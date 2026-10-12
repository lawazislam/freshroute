import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

// Every restaurant owner seeded by backend/seed.py, kept in sync with that
// file by hand since this is demo-only scaffolding (not something a real
// app would ever expose via an API). One-click login matters here because
// testing the full order lifecycle means hopping between a customer, a
// rider, and whichever restaurant actually has the order, repeatedly.
const DEMO_OWNERS = [
  { restaurant: "Rosa's Trattoria", email: "rosa@freshroute.demo" },
  { restaurant: "Saigon Street Kitchen", email: "minh@freshroute.demo" },
  { restaurant: "Spice Route Indian Kitchen", email: "devi@freshroute.demo" },
  { restaurant: "Riverside Burger Co.", email: "jamie@freshroute.demo" },
  { restaurant: "Windsor Kebab & Grill", email: "omar@freshroute.demo" },
  { restaurant: "Sakura Sushi & Ramen", email: "kenji@freshroute.demo" },
  { restaurant: "El Mercado Taqueria", email: "sofia@freshroute.demo" },
  { restaurant: "Golden Wok", email: "wei@freshroute.demo" },
  { restaurant: "Bangkok Basil", email: "anong@freshroute.demo" },
  { restaurant: "Seoul Garden", email: "minjun@freshroute.demo" },
  { restaurant: "Olympia Taverna", email: "eleni@freshroute.demo" },
  { restaurant: "Le Petit Bistro", email: "camille@freshroute.demo" },
];
const DEMO_OTHERS = [
  { label: "Rider: Remy Okafor", email: "remy@freshroute.demo" },
  { label: "Rider: Priya Nair", email: "priya@freshroute.demo" },
  { label: "Customer: Casey Morgan", email: "casey@freshroute.demo" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function doLogin(loginEmail, loginPassword) {
    setError("");
    setBusy(true);
    try {
      const user = await login(loginEmail, loginPassword);
      navigate(user.role === "customer" ? "/restaurants" : user.role === "rider" ? "/rider" : "/owner");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doLogin(email, password);
  }

  function quickLogin(demoEmail) {
    doLogin(demoEmail, "demo1234");
  }

  return (
    <AuthLayout
      kicker="Welcome back"
      title="Good to see you again."
      tagline="Log in to reorder from your favorite kitchen or pick up where you left off."
    >
      <div className="form-panel">
        <h1>Log in</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary btn-block" disabled={busy}>
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          No account? <Link to="/register">Sign up</Link>
        </p>
        <details className="demo-accounts-toggle">
          <summary>Demo accounts (every password is <code>demo1234</code>): click any to log in instantly</summary>
          <div className="demo-accounts-grid">
            {DEMO_OTHERS.map((a) => (
              <button
                key={a.email}
                type="button"
                className="btn-ghost btn-sm"
                disabled={busy}
                onClick={() => quickLogin(a.email)}
                style={{ justifyContent: "flex-start" }}
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: "0.78rem", margin: "0.8rem 0 0.3rem" }}>
            Restaurant owners, one per kitchen:
          </p>
          <div className="demo-accounts-grid">
            {DEMO_OWNERS.map((o) => (
              <button
                key={o.email}
                type="button"
                className="btn-ghost btn-sm"
                disabled={busy}
                onClick={() => quickLogin(o.email)}
                style={{ justifyContent: "flex-start" }}
              >
                {o.restaurant}
              </button>
            ))}
          </div>
        </details>
      </div>
    </AuthLayout>
  );
}
