import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart(); // always called unconditionally (Rules of Hooks); only displayed for customers below

  return (
    <nav className="nav-bar">
      <div className="container nav-inner">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h3 style={{ color: "var(--paper)", margin: 0, fontFamily: "var(--font-display)" }}>
            FreshRoute
          </h3>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Link to="/restaurants">Restaurants</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/cart">Cart{itemCount > 0 ? ` (${itemCount})` : ""}</Link>
                </>
              )}
              {user.role === "restaurant_owner" && (
                <>
                  <Link to="/owner">Orders</Link>
                  <Link to="/owner/menu">Menu</Link>
                  <Link to="/owner/analytics">Analytics</Link>
                </>
              )}
              {user.role === "rider" && (
                <>
                  <Link to="/rider">Available</Link>
                  <Link to="/rider/deliveries">My Deliveries</Link>
                </>
              )}
              <span className="nav-user">{user.name}</span>
              <button
                className="btn-ghost"
                style={{ color: "var(--paper)", borderColor: "#445048" }}
                onClick={() => { logout(); navigate("/login"); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
