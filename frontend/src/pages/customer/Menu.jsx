import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useCart } from "../../context/CartContext";
import Money from "../../components/Money";
import { SkeletonRows } from "../../components/Skeleton";

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, cart } = useCart();

  useEffect(() => {
    Promise.all([api.listRestaurants(), api.getMenu(id)])
      .then(([restaurants, menuItems]) => {
        setRestaurant(restaurants.find((r) => r.id === Number(id)));
        setMenu(menuItems);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><SkeletonRows count={5} /></div>;
  if (!restaurant) return <div className="container"><p className="error-text">Restaurant not found.</p></div>;

  const inCart = (itemId) => cart?.items?.[itemId]?.quantity || 0;

  return (
    <div className="container">
      {restaurant.image_url ? (
        <div className="menu-hero">
          <img src={restaurant.image_url} alt={`A signature dish from ${restaurant.name}, a ${restaurant.cuisine} restaurant`} />
          <div className="menu-hero-scrim">
            <div>
              <h1>{restaurant.name}</h1>
              <p>{restaurant.cuisine}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.cuisine}</p>
        </>
      )}
      <div className="menu-item-list">
        {menu.map((item) => (
          <div key={item.id} className="menu-item-card">
            <div className="menu-item-main">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="menu-item-thumb" />
              )}
              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: "0.2em" }}>{item.name}</h3>
                <p className="muted" style={{ margin: "0 0 0.4em 0", fontSize: "0.88rem" }}>{item.description}</p>
                <strong className="menu-item-price"><Money cents={item.price_cents} /></strong>
              </div>
            </div>
            <button
              className="btn-primary btn-sm"
              disabled={!item.available}
              onClick={() => addItem(restaurant, item)}
            >
              {!item.available ? "Unavailable" : inCart(item.id) > 0 ? `+1 (${inCart(item.id)} in cart)` : "Add to cart"}
            </button>
          </div>
        ))}
      </div>
      {cart && cart.restaurantId === restaurant.id && (
        <div style={{ position: "sticky", bottom: "1rem", marginTop: "1.5rem" }}>
          <button className="btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/cart")}>
            View cart →
          </button>
        </div>
      )}
    </div>
  );
}
