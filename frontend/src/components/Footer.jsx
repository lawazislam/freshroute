import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <span className="muted">© {year} FreshRoute. Portfolio demo project, not a real business.</span>
        <Link to="/about">About &amp; data use</Link>
      </div>
    </footer>
  );
}
