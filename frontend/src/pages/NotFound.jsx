import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: "3rem" }}>
      <h1 style={{ fontSize: "3rem" }}>404</h1>
      <p className="muted" style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
        That page doesn't exist, or you don't have access to it.
      </p>
      <Link to="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
        Back to FreshRoute
      </Link>
    </div>
  );
}
