import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";

export default function MenuManager() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [newRestaurantForm, setNewRestaurantForm] = useState({ name: "", cuisine: "", lat: "", lng: "" });
  const [error, setError] = useState("");

  async function load() {
    const restaurants = await api.listRestaurants();
    const mine = restaurants.find((r) => r.owner_id === user.id);
    setRestaurant(mine || null);
    if (mine) setMenu(await api.getMenu(mine.id));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreateRestaurant(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createRestaurant({
        name: newRestaurantForm.name,
        cuisine: newRestaurantForm.cuisine,
        lat: parseFloat(newRestaurantForm.lat),
        lng: parseFloat(newRestaurantForm.lng),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setError("");
    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setError("Enter a valid price.");
      return;
    }
    try {
      await api.addMenuItem(restaurant.id, {
        name: form.name, description: form.description, price_cents: priceCents, available: true,
      });
      setForm({ name: "", description: "", price: "" });
      setMenu(await api.getMenu(restaurant.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailable(item) {
    await api.updateMenuItem(item.id, {
      name: item.name, description: item.description, price_cents: item.price_cents, available: !item.available,
    });
    setMenu(await api.getMenu(restaurant.id));
  }

  if (loading) return <div className="container"><p className="muted">Loading...</p></div>;

  if (!restaurant) {
    return (
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Set up your restaurant</h1>
        <p className="muted">You haven't created a restaurant yet.</p>
        <form onSubmit={handleCreateRestaurant} className="card">
          <div className="field">
            <label>Restaurant name</label>
            <input value={newRestaurantForm.name} onChange={(e) => setNewRestaurantForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Cuisine</label>
            <input value={newRestaurantForm.cuisine} onChange={(e) => setNewRestaurantForm((f) => ({ ...f, cuisine: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input type="number" step="any" value={newRestaurantForm.lat} onChange={(e) => setNewRestaurantForm((f) => ({ ...f, lat: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input type="number" step="any" value={newRestaurantForm.lng} onChange={(e) => setNewRestaurantForm((f) => ({ ...f, lng: e.target.value }))} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" style={{ width: "100%" }}>Create restaurant</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{restaurant.name}'s menu</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
        {menu.map((item) => (
          <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.name}</strong> <Money cents={item.price_cents} />
              <div className="muted" style={{ fontSize: "0.85rem" }}>{item.description}</div>
            </div>
            <button className={item.available ? "btn-ghost" : "btn-secondary"} onClick={() => toggleAvailable(item)}>
              {item.available ? "Mark unavailable" : "Mark available"}
            </button>
          </div>
        ))}
        {menu.length === 0 && <p className="muted">No menu items yet, add your first one below.</p>}
      </div>

      <h2>Add a menu item</h2>
      <form onSubmit={handleAddItem} className="card" style={{ maxWidth: 420 }}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="field">
          <label>Price (USD)</label>
          <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" style={{ width: "100%" }}>Add item</button>
      </form>
    </div>
  );
}
