import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Money from "../../components/Money";
import Spinner from "../../components/Spinner";

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

  if (loading) {
    return (
      <div className="container" style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <Spinner label="Loading analytics…" />
      </div>
    );
  }
  if (!restaurant) return <div className="container"><p className="muted">Set up your restaurant first.</p></div>;
  if (!data) return <div className="container"><p className="muted">No data yet.</p></div>;

  const { top_items, daily_orders, totals } = data;
  const maxUnits = Math.max(1, ...top_items.map((i) => i.units_sold));
  const maxDailyRevenue = Math.max(1, ...daily_orders.map((d) => d.revenue_cents));

  return (
    <div className="container">
      <h1>Analytics</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="stat-card" style={{ "--stat-accent": "var(--chili-red)" }}>
          <div className="stat-card-label">Total orders</div>
          <div className="stat-card-value">{totals.total_orders}</div>
        </div>
        <div className="stat-card" style={{ "--stat-accent": "var(--ink-soft)" }}>
          <div className="stat-card-label">Cancelled</div>
          <div className="stat-card-value">{totals.cancelled_orders || 0}</div>
        </div>
        <div className="stat-card" style={{ "--stat-accent": "var(--turmeric-gold)" }}>
          <div className="stat-card-label">Revenue</div>
          <div className="stat-card-value"><Money cents={totals.total_revenue_cents || 0} /></div>
        </div>
      </div>

      <h2>Top-selling items</h2>
      {top_items.length === 0 && <p className="muted">No completed orders yet.</p>}
      <div className="card" style={{ marginBottom: "2rem" }}>
        {top_items.map((item) => (
          <div key={item.name} className="chart-bar-row">
            <div className="chart-bar-head">
              <span>{item.name}</span>
              <span className="muted">{item.units_sold} sold · <Money cents={item.revenue_cents} /></span>
            </div>
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ width: `${(item.units_sold / maxUnits) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2>Orders by day</h2>
      {daily_orders.length === 0 && <p className="muted">No completed orders yet.</p>}
      <div className="card">
        <div className="chart-columns">
          {daily_orders.map((d) => (
            <div key={d.day} className="chart-column" title={`${d.order_count} orders, $${(d.revenue_cents / 100).toFixed(2)}`}>
              <div className="chart-column-bar" style={{ height: `${(d.revenue_cents / maxDailyRevenue) * 110}px` }} />
              <div className="chart-column-label">{d.day.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
