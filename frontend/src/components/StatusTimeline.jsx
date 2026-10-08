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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const time = timeByStatus[step];
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: done ? "var(--chili-red)" : "var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.65rem", fontWeight: 700,
              }}
            >
              {done ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: done ? 600 : 400, color: done ? "var(--ink)" : "var(--ink-soft)" }}>
                {LABELS[step]}
              </div>
              {time && <div className="muted" style={{ fontSize: "0.78rem" }}>{time}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
