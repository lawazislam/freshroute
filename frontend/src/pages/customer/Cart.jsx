import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";

export default function Cart() {
  const { cart, addItem, removeItem, clearCart, subtotalCents } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!cart) {
    return (
      <div className="container">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty. <a href="/restaurants">Browse restaurants</a> to get started.</p>
      </div>
    );
  }

  async function handlePlaceOrder() {
    setError("");
    setPlacing(true);
    try {
      const order = await api.placeOrder({
        restaurant_id: cart.restaurantId,
        items: Object.values(cart.items).map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_lat: user.lat,
        delivery_lng: user.lng,
      });
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1>Your cart</h1>
      <p className="muted">{cart.restaurantName}</p>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {Object.values(cart.items).map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.name}</strong>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                <Money cents={item.price_cents} /> each
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="btn-ghost" onClick={() => removeItem(item.id)} style={{ padding: "0.3em 0.7em" }}>−</button>
              <span>{item.quantity}</span>
              <button className="btn-ghost" onClick={() => addItem({ id: cart.restaurantId, name: cart.restaurantName }, item)} style={{ padding: "0.3em 0.7em" }}>+</button>
            </div>
          </div>
        ))}
        <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <strong><Money cents={subtotalCents} /></strong>
        </div>
        <p className="muted" style={{ fontSize: "0.82rem", margin: 0 }}>
          Delivery fee is calculated from the restaurant's distance to your address and shown at checkout.
        </p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" onClick={handlePlaceOrder} disabled={placing} style={{ width: "100%" }}>
          {placing ? "Placing order..." : "Place order"}
        </button>
      </div>
    </div>
  );
}
