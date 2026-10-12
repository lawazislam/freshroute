import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

const BANNER_IMG = "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&q=75&auto=format&fit=crop";

const SORTS = {
  pay: { label: "Best pay", compare: (a, b) => b.delivery_fee_cents - a.delivery_fee_cents },
  near: { label: "Nearest", compare: (a, b) => a.distance_km - b.distance_km },
};

export default function Available() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState("");
  const [conflictToast, setConflictToast] = useState("");
  const [sortKey, setSortKey] = useState("pay");

  const load = useCallback(() => {
    return api.listOrders().then((all) => setOrders(all.filter((o) => o.status === "preparing" && !o.rider_id)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleClaim(orderId) {
    setError("");
    setConflictToast("");
    setClaiming(orderId);
    try {
      await api.claimOrder(orderId);
      navigate("/rider/deliveries");
    } catch (err) {
      // A 409 specifically means another rider got there first; that's
      // an expected, routine outcome of everyone seeing the same list,
      // not an error worth alarming over, so it gets its own calmer
      // message and immediately drops off the list below.
      if (err.message.includes("already been claimed")) {
        setConflictToast("Someone else just claimed that one. Here's what's still open.");
      } else {
        setError(err.message);
      }
      load();
    } finally {
      setClaiming(null);
    }
  }

  const sortedOrders = [...orders].sort(SORTS[sortKey].compare);

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
      {conflictToast && <div className="claim-toast">⚡ {conflictToast}</div>}
      {error && <p className="error-text">{error}</p>}
      {!loading && orders.length > 0 && (
        <div className="sort-toggle">
          {Object.entries(SORTS).map(([key, { label }]) => (
            <button
              key={key}
              className={sortKey === key ? "active" : ""}
              onClick={() => setSortKey(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <SkeletonRows count={3} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="bike"
          title="Nothing available right now"
          message="New deliveries will show up here the moment a restaurant marks an order ready."
        />
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {sortedOrders.map((o) => (
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
      )}
    </div>
  );
}
