export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
export default function Money({ cents }) {
  return <>{formatCents(cents)}</>;
}
