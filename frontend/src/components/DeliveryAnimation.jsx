// A lightweight animated SVG, not a literal 3D render: a scooter glides
// back and forth along a dashed route. CSS-driven (see .delivery-animation*
// in index.css) so it's cheap, loops forever, and respects
// prefers-reduced-motion automatically.
export default function DeliveryAnimation() {
  return (
    <svg viewBox="0 0 300 64" className="delivery-animation" aria-hidden="true">
      <line x1="6" y1="50" x2="294" y2="50" stroke="rgba(247,243,237,0.35)" strokeWidth="3" strokeDasharray="7 9" />
      <g className="delivery-animation-bike">
        <circle cx="16" cy="44" r="7" fill="none" stroke="var(--turmeric-gold)" strokeWidth="3" />
        <circle cx="40" cy="44" r="7" fill="none" stroke="var(--turmeric-gold)" strokeWidth="3" />
        <path
          d="M16 44 L26 26 L37 26 M26 26 L32 44 M37 26 L44 44 M32 26 L32 15 L42 12"
          fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        <rect x="6" y="18" width="12" height="9" rx="2" fill="var(--chili-red)" />
      </g>
    </svg>
  );
}
