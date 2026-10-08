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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {restaurants.map((r) => (
          <Link key={r.id} to={`/restaurants/${r.id}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ height: "100%" }}>
              <h3>{r.name}</h3>
              <p className="muted" style={{ margin: 0 }}>{r.cuisine}</p>
            </div>
          </Link>
        ))}
      </div>
      {restaurants.length === 0 && <p className="muted">No restaurants yet.</p>}
    </div>
  );
}
