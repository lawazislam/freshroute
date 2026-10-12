export default function Spinner({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6em" }}>
      <span className="spinner" aria-hidden="true" />
      {label && <span className="muted">{label}</span>}
    </span>
  );
}
