/* Shared branded shell for Login and Register. Keeps the two-column
   split (charcoal-green brand panel + form) in one place instead of
   duplicating the markup, and gives both pages the same "this is a
   real product, not a floating card" treatment as the home hero. */

const POINTS = [
  "Ten kitchens across Windsor, one cart",
  "Live order tracking from kitchen to door",
  "Delivery pricing based on real distance",
];

export default function AuthLayout({ kicker, title, tagline, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout-brand">
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{tagline}</p>
        <ul className="auth-layout-brand-list">
          {POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="auth-layout-form">{children}</div>
    </div>
  );
}
