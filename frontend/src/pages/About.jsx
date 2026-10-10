export default function About() {
  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>About FreshRoute</h1>
      <p>
        FreshRoute is a portfolio project: a working demonstration of a
        role-based food delivery platform, not a real business. There is no
        real company behind it, no real restaurants are actually taking
        orders, and no real payments or deliveries occur anywhere in the
        system.
      </p>

      <h2>What data this app actually collects</h2>
      <p>
        An account stores the name, email, and password you provide at
        registration (the password is salted and hashed, never stored in
        plain text), plus your role and, for customers, a delivery
        location used only to calculate distance-based pricing within this
        demo. Placing a demo order stores the order's items, status
        history, and the delivery coordinates you provided. Nothing is
        sold, shared with third parties, or used for anything beyond
        making this demo function.
      </p>

      <h2>What this app does not do</h2>
      <p>
        It does not process real payments, does not deliver real food, and
        does not use any third-party analytics or advertising trackers.
        Session tokens are held in memory on the server and in your
        browser's local storage, and clear when you log out.
      </p>

      <p className="muted" style={{ fontSize: "0.88rem", marginTop: "2rem" }}>
        If you have questions about this project, it was built as a
        software engineering portfolio piece.
      </p>
    </div>
  );
}
