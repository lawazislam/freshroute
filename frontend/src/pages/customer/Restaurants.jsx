import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listRestaurants()
      .then(setRestaurants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p className="muted">Loading restaurants...</p></div>;
  if (error) return <div className="container"><p className="error-text">{error}</p></div>;

  return (
    <div className="container">
      <h1>Restaurants</h1>
      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <Link key={r.id} to={`/restaurants/${r.id}`} className="restaurant-card-link" aria-label={`View menu for ${r.name}, ${r.cuisine}`}>
            <div className="restaurant-card">
              <div className="restaurant-card-image-wrap">
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt={`A signature dish from ${r.name}, a ${r.cuisine} restaurant`}
                    className="restaurant-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="restaurant-card-image-fallback" aria-hidden="true">{r.name.charAt(0)}</div>
                )}
              </div>
              <div className="restaurant-card-body">
                <h3>{r.name}</h3>
                <p className="muted" style={{ margin: 0 }}>{r.cuisine}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {restaurants.length === 0 && <p className="muted">No restaurants yet.</p>}
    </div>
  );
}
