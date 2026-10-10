// A real sequence (order lifecycle), so the step-marker treatment is earned
// here rather than decorative.
const STEPS = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
const LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export default function StatusTimeline({ currentStatus, history = [] }) {
  if (currentStatus === "cancelled") {
    return <p className="error-text">This order was cancelled.</p>;
  }
  const currentIndex = STEPS.indexOf(currentStatus);
  const timeByStatus = Object.fromEntries(history.map((h) => [h.status, h.changed_at]));

  return (
    <div>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        const time = timeByStatus[step];
        return (
          <div key={step} className="timeline-step">
            <div className="timeline-marker-col">
              <div className={`timeline-marker ${done ? "done" : "pending"}`}>{done ? "✓" : ""}</div>
              {!isLast && <div className={`timeline-line ${i < currentIndex ? "done" : "pending"}`} />}
            </div>
            <div style={{ flex: 1 }}>
              <div className={`timeline-step-label ${done ? "" : "pending"}`}>{LABELS[step]}</div>
              {time && <div className="muted" style={{ fontSize: "0.78rem" }}>{time}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
