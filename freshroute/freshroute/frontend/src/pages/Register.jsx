import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Customers need a delivery location on file; default to downtown Windsor
      // if geolocation isn't granted, so ordering still works for the demo.
      const payload = { ...form };
      if (form.role === "customer") {
        payload.lat = 42.3149;
        payload.lng = -83.0364;
      }
      const user = await register(payload);
      navigate(user.role === "customer" ? "/restaurants" : user.role === "rider" ? "/rider" : "/owner");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" minLength={8} value={form.password}
                 onChange={(e) => update("password", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="role">I am a</label>
          <select id="role" value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="customer">Customer, ordering food</option>
            <option value="restaurant_owner">Restaurant owner</option>
            <option value="rider">Delivery rider</option>
          </select>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
