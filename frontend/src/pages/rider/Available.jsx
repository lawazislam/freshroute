import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";

const BANNER_IMG = "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&q=75&auto=format&fit=crop";

export default function Available() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.listOrders().then((all) => setOrders(all.filter((o) => o.status === "preparing" && !o.rider_id)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleClaim(orderId) {
    setError("");
    setClaiming(orderId);
    try {
      await api.claimOrder(orderId);
      navigate("/rider/deliveries");
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setClaiming(null);
    }
  }

  if (loading) return <div className="container"><p className="muted">Loading...</p></div>;

  return (
    <div className="container">
      <div className="role-banner role-banner-rider">
        <img src={BANNER_IMG} alt="" aria-hidden="true" />
        <div className="role-banner-scrim">
          <div>
            <h1>{user?.name ? `Ride on, ${user.name.split(" ")[0]}` : "Today's deliveries"}</h1>
            <p>Claim a delivery that's ready and waiting.</p>
          </div>
        </div>
      </div>
      <h2>Available deliveries</h2>
      {error && <p className="error-text">{error}</p>}
      {orders.length === 0 && <p className="muted">Nothing available right now, check back soon.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{o.restaurant_name}</strong>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                {o.distance_km} km to delivery · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Money cents={o.delivery_fee_cents} />
              <button className="btn-primary" disabled={claiming === o.id} onClick={() => handleClaim(o.id)}>
                {claiming === o.id ? "Claiming..." : "Claim"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
