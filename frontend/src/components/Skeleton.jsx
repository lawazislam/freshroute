/* Shape-matched loading placeholders. Replaces plain "Loading..." text
   with a shimmer in roughly the shape of what's about to arrive, so the
   page doesn't visually jump once data loads. */

export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-card-image" />
          <div className="skeleton-card-body">
            <div className="skeleton skeleton-line" style={{ width: "70%" }} />
            <div className="skeleton skeleton-line-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton skeleton-row-thumb" />
          <div className="skeleton-row-lines">
            <div className="skeleton skeleton-line" style={{ width: "40%" }} />
            <div className="skeleton skeleton-line-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
