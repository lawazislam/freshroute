import { Link } from "react-router-dom";

/* A handful of plain inline SVG icons so empty states don't all look
   identical, and so we don't pull in an icon library for four glyphs. */
const ICONS = {
  plate: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  bag: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 7h12l1 13H5L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  ),
  receipt: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
      <path d="M9 7h6M9 11h6" />
    </svg>
  ),
  bike: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="17" r="3.2" />
      <circle cx="18" cy="17" r="3.2" />
      <path d="M6 17l4-8h5l3 8M10 9H8" />
    </svg>
  ),
};

export default function EmptyState({ icon = "plate", title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">{ICONS[icon] || ICONS.plate}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary">{actionLabel}</Link>
      )}
    </div>
  );
}
