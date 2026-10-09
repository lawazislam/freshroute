import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

const BANNER_IMG = "https://images.unsplash.com/photo-1611778948399-840d64180923?w=1600&q=75&auto=format&fit=crop";

export default function Restaurants() {
  const { user } = useAuth();
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
      <div className="role-banner role-banner-customer">
        <img src={BANNER_IMG} alt="" aria-hidden="true" />
        <div className="role-banner-scrim">
          <div>
            <h1>Good to see you{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <p>Pick a kitchen and we'll bring it to your door.</p>
          </div>
        </div>
      </div>
      <h2>Restaurants</h2>
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
