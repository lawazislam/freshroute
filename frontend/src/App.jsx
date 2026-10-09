import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Restaurants from "./pages/customer/Restaurants";
import Menu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import Orders from "./pages/customer/Orders";
import OrderDetail from "./pages/customer/OrderDetail";
import Dashboard from "./pages/restaurant/Dashboard";
import MenuManager from "./pages/restaurant/MenuManager";
import Analytics from "./pages/restaurant/Analytics";
import Available from "./pages/rider/Available";
import MyDeliveries from "./pages/rider/MyDeliveries";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Home from "./pages/Home";

function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container"><p className="muted">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container"><p className="muted">Loading...</p></div>;
  if (!user) return <Home />;
  if (user.role === "customer") return <Navigate to="/restaurants" replace />;
  if (user.role === "restaurant_owner") return <Navigate to="/owner" replace />;
  return <Navigate to="/rider" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Nav />
          <main id="main-content">
          <Routes>
            <Route path="/" element={<RoleHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            <Route path="/restaurants" element={<RequireRole role="customer"><Restaurants /></RequireRole>} />
            <Route path="/restaurants/:id" element={<RequireRole role="customer"><Menu /></RequireRole>} />
            <Route path="/cart" element={<RequireRole role="customer"><Cart /></RequireRole>} />
            <Route path="/orders" element={<RequireRole role="customer"><Orders /></RequireRole>} />
            <Route path="/orders/:id" element={<RequireRole role="customer"><OrderDetail /></RequireRole>} />

            <Route path="/owner" element={<RequireRole role="restaurant_owner"><Dashboard /></RequireRole>} />
            <Route path="/owner/menu" element={<RequireRole role="restaurant_owner"><MenuManager /></RequireRole>} />
            <Route path="/owner/analytics" element={<RequireRole role="restaurant_owner"><Analytics /></RequireRole>} />

            <Route path="/rider" element={<RequireRole role="rider"><Available /></RequireRole>} />
            <Route path="/rider/deliveries" element={<RequireRole role="rider"><MyDeliveries /></RequireRole>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
