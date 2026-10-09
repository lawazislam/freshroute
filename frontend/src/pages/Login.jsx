import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "customer" ? "/restaurants" : user.role === "rider" ? "/rider" : "/owner");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        No account? <Link to="/register">Sign up</Link>
      </p>
      <p className="muted" style={{ fontSize: "0.82rem", marginTop: "1.5rem" }}>
        Demo accounts (password <code>demo1234</code>): rosa@freshroute.demo (restaurant owner),
        remy@freshroute.demo (rider), casey@freshroute.demo (customer)
      </p>
    </div>
  );
}
