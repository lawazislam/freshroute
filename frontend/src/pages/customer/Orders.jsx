import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Money from "../../components/Money";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><h1>My orders</h1><SkeletonRows count={4} /></div>;

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1>My orders</h1>
        <EmptyState
          icon="receipt"
          title="No orders yet"
          message="Once you place an order, you'll be able to track it here."
          actionLabel="Browse restaurants"
          actionTo="/restaurants"
        />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My orders</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} style={{ textDecoration: "none" }}>
            <div className="card list-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{o.restaurant_name}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{o.created_at}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Money cents={o.total_cents} />
                <StatusBadge status={o.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
