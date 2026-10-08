import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Money from "../../components/Money";

const RIDER_ACTIONS = {
  preparing: { to: "out_for_delivery", label: "Picked up, heading out" },
  out_for_delivery: { to: "delivered", label: "Mark delivered" },
};

export default function MyDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.listOrders().then((all) => setOrders(all.filter((o) => o.rider_id !== null)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function act(orderId, status) {
    setError("");
    setActing(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(null);
    }
  }

  if (loading) return <div className="container"><p className="muted">Loading...</p></div>;

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completed = orders.filter((o) => o.status === "delivered");

  return (
    <div className="container">
      <h1>My deliveries</h1>
      {error && <p className="error-text">{error}</p>}
      {active.length === 0 && <p className="muted">No active deliveries. Check Available for new orders.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
        {active.map((o) => {
          const action = RIDER_ACTIONS[o.status];
          return (
            <div key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong>{o.restaurant_name}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>{o.distance_km} km</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6em" }}>
                <Money cents={o.delivery_fee_cents} />
                {action && (
                  <button className="btn-primary" disabled={acting === o.id} onClick={() => act(o.id, action.to)}>
                    {acting === o.id ? "Updating..." : action.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completed.length > 0 && (
        <>
          <h2>Completed</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {completed.map((o) => (
              <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", opacity: 0.75 }}>
                <span>{o.restaurant_name}</span>
                <Money cents={o.delivery_fee_cents} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
