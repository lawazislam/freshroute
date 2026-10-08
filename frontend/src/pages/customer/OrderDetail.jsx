import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import StatusTimeline from "../../components/StatusTimeline";
import Money from "../../components/Money";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    function load() {
      Promise.all([api.getOrder(id), api.getOrderHistory(id)])
        .then(([o, h]) => { if (mounted) { setOrder(o); setHistory(h); } })
        .finally(() => { if (mounted) setLoading(false); });
    }
    load();
    // Poll for live status updates every 5s, since this is a tracking view.
    const interval = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [id]);

  if (loading) return <div className="container"><p className="muted">Loading order...</p></div>;
  if (!order) return <div className="container"><p className="error-text">Order not found.</p></div>;

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h1>Order #{order.id}</h1>
      <p className="muted">{order.restaurant_name}</p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Status</h3>
        <StatusTimeline currentStatus={order.status} history={history} />
      </div>

      <div className="card">
        <h3>Order details</h3>
        {order.items.map((item) => (
          <div key={item.menu_item_id} style={{ display: "flex", justifyContent: "space-between", margin: "0.4em 0" }}>
            <span>{item.quantity} × {item.name}</span>
            <span><Money cents={item.unit_price_cents * item.quantity} /></span>
          </div>
        ))}
        <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="muted">Subtotal</span>
          <span><Money cents={order.subtotal_cents} /></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="muted">Delivery fee ({order.distance_km} km)</span>
          <span><Money cents={order.delivery_fee_cents} /></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: "0.4em" }}>
          <span>Total</span>
          <span><Money cents={order.total_cents} /></span>
        </div>
      </div>
    </div>
  );
}
