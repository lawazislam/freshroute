import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import Money from "../../components/Money";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

const BANNER_IMG = "https://images.unsplash.com/photo-1697659602792-31dcb2a5a4ec?w=1600&q=75&auto=format&fit=crop";

// What each current status can legally move to, from the owner's side.
// Mirrors backend/state_machine.py exactly, so the UI never offers an
// action the API would reject.
const OWNER_ACTIONS = {
  placed: [{ to: "confirmed", label: "Confirm order" }, { to: "cancelled", label: "Cancel" }],
  confirmed: [{ to: "preparing", label: "Start preparing" }, { to: "cancelled", label: "Cancel" }],
  preparing: [{ to: "cancelled", label: "Cancel" }], // next step (pickup) belongs to the rider
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.listOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function act(orderId, status) {
    setError("");
    setActingOn(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="role-banner role-banner-owner">
          <img src={BANNER_IMG} alt="" aria-hidden="true" />
          <div className="role-banner-scrim">
            <div>
              <h1>{user?.name ? `${user.name}'s kitchen` : "Your kitchen"}</h1>
              <p>Confirm, prepare, and hand off orders as they come in.</p>
            </div>
          </div>
        </div>
        <h2>Incoming orders</h2>
        <SkeletonRows count={3} />
      </div>
    );
  }

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <div className="container">
      <div className="role-banner role-banner-owner">
        <img src={BANNER_IMG} alt="" aria-hidden="true" />
        <div className="role-banner-scrim">
          <div>
            <h1>{user?.name ? `${user.name}'s kitchen` : "Your kitchen"}</h1>
            <p>Confirm, prepare, and hand off orders as they come in.</p>
          </div>
        </div>
      </div>
      <h2>Incoming orders</h2>
      {error && <p className="error-text">{error}</p>}
      {active.length === 0 ? (
        <EmptyState icon="receipt" title="No active orders right now" message="New orders will show up here as soon as they come in." />
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
        {active.map((o) => (
          <div key={o.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong>Order #{o.id}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{o.created_at}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div style={{ margin: "0.6em 0" }}>
              {o.items.map((item) => (
                <div key={item.menu_item_id} style={{ fontSize: "0.9rem" }}>
                  {item.quantity} × {item.name}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong><Money cents={o.total_cents} /></strong>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(OWNER_ACTIONS[o.status] || []).map((action) => (
                  <button
                    key={action.to}
                    className={action.to === "cancelled" ? "btn-ghost" : "btn-primary"}
                    disabled={actingOn === o.id}
                    onClick={() => act(o.id, action.to)}
                  >
                    {action.label}
                  </button>
                ))}
                {o.status === "preparing" && (
                  <span className="muted" style={{ fontSize: "0.85rem", alignSelf: "center" }}>
                    {o.rider_id ? "Rider assigned, awaiting pickup" : "Waiting for a rider to claim"}
                  </span>
                )}
                {o.status === "out_for_delivery" && (
                  <span className="muted" style={{ fontSize: "0.85rem", alignSelf: "center" }}>
                    Out with rider
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {past.length > 0 && (
        <>
          <h2>Past orders</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {past.map((o) => (
              <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", opacity: 0.75 }}>
                <span>Order #{o.id} · {o.created_at}</span>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Money cents={o.total_cents} />
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
