import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart(); // always called unconditionally (Rules of Hooks); only displayed for customers below
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically on navigation, so it never stays
  // open covering the new page after a link is clicked.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <nav className="nav-bar">
      <div className="container nav-inner">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h3 style={{ color: "var(--paper)", margin: 0, fontFamily: "var(--font-display)" }}>
            FreshRoute
          </h3>
        </Link>
        <button
          className="nav-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="nav-links"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-menu-toggle-bar" />
          <span className="nav-menu-toggle-bar" />
          <span className="nav-menu-toggle-bar" />
        </button>
        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`} id="nav-links">
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
