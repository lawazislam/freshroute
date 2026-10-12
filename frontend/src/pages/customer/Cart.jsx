import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

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
        <EmptyState
          icon="bag"
          title="Your cart is empty"
          message="Add a few things from a restaurant to get started."
          actionLabel="Browse restaurants"
          actionTo="/restaurants"
        />
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                />
              )}
              <div>
                <strong>{item.name}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  <Money cents={item.price_cents} /> each
                </div>
              </div>
            </div>
            <div className="qty-stepper">
              <button className="btn-ghost btn-sm" onClick={() => removeItem(item.id)} aria-label={`Remove one ${item.name}`}>−</button>
              <span>{item.quantity}</span>
              <button className="btn-ghost btn-sm" onClick={() => addItem({ id: cart.restaurantId, name: cart.restaurantName }, item)} aria-label={`Add one more ${item.name}`}>+</button>
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
        <button className="btn-primary btn-block btn-lg" onClick={handlePlaceOrder} disabled={placing}>
          {placing ? <Spinner label="Placing order…" /> : "Place order"}
        </button>
      </div>
    </div>
  );
}
