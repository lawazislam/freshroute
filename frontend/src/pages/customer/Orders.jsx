import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Money from "../../components/Money";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p className="muted">Loading orders...</p></div>;

  return (
    <div className="container">
      <h1>My orders</h1>
      {orders.length === 0 && <p className="muted">No orders yet. <Link to="/restaurants">Browse restaurants</Link>.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
