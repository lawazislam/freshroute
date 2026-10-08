import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";

export default function Analytics() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listRestaurants().then(async (restaurants) => {
      const mine = restaurants.find((r) => r.owner_id === user.id);
      setRestaurant(mine || null);
      if (mine) setData(await api.getAnalytics(mine.id));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container"><p className="muted">Loading analytics...</p></div>;
  if (!restaurant) return <div className="container"><p className="muted">Set up your restaurant first.</p></div>;
  if (!data) return <div className="container"><p className="muted">No data yet.</p></div>;

  const { top_items, daily_orders, totals } = data;
  const maxUnits = Math.max(1, ...top_items.map((i) => i.units_sold));
  const maxDailyRevenue = Math.max(1, ...daily_orders.map((d) => d.revenue_cents));

  return (
    <div className="container">
      <h1>Analytics</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.82rem" }}>Total orders</div>
          <div style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)" }}>{totals.total_orders}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.82rem" }}>Cancelled</div>
          <div style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)" }}>{totals.cancelled_orders || 0}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.82rem" }}>Revenue</div>
          <div style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)" }}>
            <Money cents={totals.total_revenue_cents || 0} />
          </div>
        </div>
      </div>

      <h2>Top-selling items</h2>
      {top_items.length === 0 && <p className="muted">No completed orders yet.</p>}
      <div className="card" style={{ marginBottom: "2rem" }}>
        {top_items.map((item) => (
          <div key={item.name} style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.25em" }}>
              <span>{item.name}</span>
              <span className="muted">{item.units_sold} sold · <Money cents={item.revenue_cents} /></span>
            </div>
            <div style={{ background: "var(--paper-dim)", borderRadius: 4, height: 8 }}>
              <div style={{
                width: `${(item.units_sold / maxUnits) * 100}%`,
                background: "var(--chili-red)", height: "100%", borderRadius: 4,
              }} />
            </div>
          </div>
        ))}
      </div>

      <h2>Orders by day</h2>
      {daily_orders.length === 0 && <p className="muted">No completed orders yet.</p>}
      <div className="card" style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 160 }}>
        {daily_orders.map((d) => (
          <div key={d.day} style={{ flex: 1, textAlign: "center" }} title={`${d.order_count} orders, $${(d.revenue_cents/100).toFixed(2)}`}>
            <div style={{
              height: `${(d.revenue_cents / maxDailyRevenue) * 110}px`,
              background: "var(--turmeric-gold)", borderRadius: "3px 3px 0 0", marginBottom: "0.4em",
            }} />
            <div style={{ fontSize: "0.68rem" }} className="muted">{d.day.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
