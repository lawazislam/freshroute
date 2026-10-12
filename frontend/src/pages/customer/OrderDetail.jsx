import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import StatusTimeline from "../../components/StatusTimeline";
import DeliveryAnimation from "../../components/DeliveryAnimation";
import Money from "../../components/Money";
import { SkeletonRows } from "../../components/Skeleton";

// Mirrors backend/app.py's CANCEL_GRACE_SECONDS. Duplicated rather than
// fetched because it's a display-only countdown; the backend re-checks
// the real window itself on every cancel request regardless of what the
// client's clock says.
const CANCEL_GRACE_SECONDS = 10;
// A flat estimate, not a real routing calculation, shown as a plain
// "about this long" window rather than false precision.
const ESTIMATED_DELIVERY_MINUTES = 25;

function parseServerTimestamp(s) {
  // The backend returns naive UTC strings like "2026-10-10 04:02:04"; the
  // Z suffix is what makes JS parse it as UTC instead of local time.
  return new Date(s.replace(" ", "T") + "Z");
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    return Promise.all([api.getOrder(id), api.getOrderHistory(id)])
      .then(([o, h]) => { setOrder(o); setHistory(h); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    // Poll for live status updates every 5s, since this is a tracking view.
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    // A faster, network-free tick just to redraw the cancel countdown
    // every second; the 5s interval above is what actually re-syncs data.
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (loading) return <div className="container" style={{ maxWidth: 560 }}><SkeletonRows count={3} /></div>;
  if (!order) return <div className="container"><p className="error-text">Order not found.</p></div>;

  const secondsSincePlaced = (now - parseServerTimestamp(order.created_at).getTime()) / 1000;
  const cancelSecondsLeft = Math.max(0, Math.ceil(CANCEL_GRACE_SECONDS - secondsSincePlaced));
  const canSelfCancel = order.status === "placed" && cancelSecondsLeft > 0;

  async function handleCancel() {
    setActionError("");
    setCancelling(true);
    try {
      await api.updateOrderStatus(order.id, "cancelled");
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  async function handleConfirmReceipt() {
    setActionError("");
    setConfirming(true);
    try {
      await api.updateOrderStatus(order.id, "completed");
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setConfirming(false);
    }
  }

  const pickedUpEvent = history.find((h) => h.status === "out_for_delivery");
  let etaLabel = null;
  if (order.status === "out_for_delivery" && pickedUpEvent) {
    const eta = new Date(
      parseServerTimestamp(pickedUpEvent.changed_at).getTime() + ESTIMATED_DELIVERY_MINUTES * 60000
    );
    etaLabel = eta.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h1>Order #{order.id}</h1>
      <p className="muted">{order.restaurant_name}</p>

      {actionError && <p className="error-text">{actionError}</p>}

      {canSelfCancel && (
        <div className="cancel-window">
          <span className="cancel-window-text">Changed your mind? You can still cancel this for free.</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="cancel-window-count">{cancelSecondsLeft}s</span>
            <button className="btn-ghost" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelling…" : "Cancel order"}
            </button>
          </div>
        </div>
      )}

      {order.status === "out_for_delivery" && (
        <div className="enroute-banner">
          <div className="enroute-banner-head">
            <span className="enroute-banner-title">Your food is on its way!</span>
            {etaLabel && <span className="enroute-banner-eta">Arriving by ~{etaLabel}</span>}
          </div>
          <DeliveryAnimation />
        </div>
      )}

      {order.status === "delivered" && (
        <div className="confirm-receipt">
          <p>Your rider marked this as delivered. Did it actually arrive?</p>
          <button className="btn-primary" disabled={confirming} onClick={handleConfirmReceipt}>
            {confirming ? "Confirming…" : "Yes, I received my order"}
          </button>
        </div>
      )}

      {order.status === "completed" && (
        <div className="order-complete-banner">
          ✓ Order complete. Thanks for ordering through FreshRoute!
        </div>
      )}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Status</h3>
        <StatusTimeline currentStatus={order.status} history={history} />
      </div>

      <div className="card">
        <h3>Order details</h3>
        {order.items.map((item) => (
          <div key={item.menu_item_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.4em 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "7px", flexShrink: 0 }}
                />
              )}
              {item.quantity} × {item.name}
            </span>
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
