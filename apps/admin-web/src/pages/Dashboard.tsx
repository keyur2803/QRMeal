/**
 * Dashboard — Live orders, stats, kitchen queue & popular items.
 * Matches dashboard.html design exactly.
 */

import { useCallback, useEffect, useState } from "react";
import { fetchOrders } from "../api/orders";
import type { OrderSummary } from "../types/order";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:   { cls: "badge-teal",   label: "New" },
    preparing: { cls: "badge-amber",  label: "Preparing" },
    ready:     { cls: "badge-green",  label: "Ready" },
    served:    { cls: "badge-slate",  label: "Served" },
  };
  const s = map[status] ?? { cls: "badge-slate", label: status };
  return <span className={`or-badge badge ${s.cls}`}>{s.label}</span>;
}

const TABLE_COLORS = [
  { bg: "var(--teal-50)",     color: "var(--teal-700)" },
  { bg: "var(--amber-100)",   color: "var(--amber-600)" },
  { bg: "var(--lavender-50)", color: "var(--lavender-400)" },
  { bg: "var(--slate-100)",   color: "var(--slate-500)" },
];

function tableColor(table: string) {
  let n = 0;
  for (const c of table) n += c.charCodeAt(0);
  return TABLE_COLORS[n % TABLE_COLORS.length];
}

// Static popular items (would come from analytics endpoint in future)
const POPULAR = [
  { name: "Margherita Pizza", count: "18x" },
  { name: "Truffle Pasta",    count: "14x" },
  { name: "Grilled Salmon",   count: "11x" },
  { name: "Caesar Salad",     count: "9x" },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      // silently fail — dashboard degrades gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const active    = orders.filter(o => ["pending","preparing","ready"].includes(o.status)).length;
  const preparing = orders.filter(o => o.status === "preparing").length;
  const pending   = orders.filter(o => o.status === "pending").length;
  const readyCount = orders.filter(o => o.status === "ready").length;
  const todayRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const queueLoad = Math.min(100, Math.round(((preparing + pending) / Math.max(orders.length, 1)) * 100));

  const liveOrders = [...orders]
    .filter(o => o.status !== "served")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="animate-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">The Gourmet Kitchen — Real-time Overview</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm">🔔 Notifications</button>
          <button className="btn btn-primary btn-sm" style={{ fontSize: 13 }}>Open Kitchen View</button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--teal-50)", color: "var(--teal-600)" }}>📋</div>
          <div className="stat-val">{loading ? "—" : active}</div>
          <div className="stat-label">Active Orders</div>
          <div className="stat-change up">▲ 12% from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--amber-100)", color: "var(--amber-600)" }}>⏱</div>
          <div className="stat-val">8 min</div>
          <div className="stat-label">Avg. Prep Time</div>
          <div className="stat-change up">▲ 2 min faster</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--green-100)", color: "var(--green-600)" }}>💰</div>
          <div className="stat-val">${todayRevenue.toFixed(0)}</div>
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-change up">▲ 18% vs last week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--lavender-50)", color: "var(--lavender-400)" }}>👥</div>
          <div className="stat-val">{loading ? "—" : orders.length}</div>
          <div className="stat-label">Tables Served</div>
          <div className="stat-change up">▲ 8% from yesterday</div>
        </div>
      </div>

      {/* Content grid */}
      <div className="content-grid">
        {/* Live Orders panel */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Live Orders
            <span className="dash-panel-badge badge-teal">{active} active</span>
          </div>
          {loading ? (
            <div style={{ color: "var(--slate-400)", fontSize: 14, textAlign: "center", padding: 24 }}>
              Loading orders...
            </div>
          ) : liveOrders.length === 0 ? (
            <div style={{ color: "var(--slate-400)", fontSize: 14, textAlign: "center", padding: 24 }}>
              No active orders right now
            </div>
          ) : (
            liveOrders.map(order => {
              const tc = tableColor(order.table);
              return (
                <div className="order-row" key={order.id}>
                  <div className="or-table" style={{ background: tc.bg, color: tc.color }}>
                    {order.table}
                  </div>
                  <div className="or-info">
                    <div className="or-items">{order.customerName || "Guest"} · #{order.orderCode}</div>
                    <div className="or-time">{timeAgo(order.createdAt)}</div>
                  </div>
                  {statusBadge(order.status)}
                </div>
              );
            })
          )}
        </div>

        {/* Right side panels */}
        <div className="dash-side-panels">
          {/* Kitchen Queue */}
          <div className="dash-panel">
            <div className="dash-panel-title">Kitchen Queue</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "var(--slate-500)" }}>Load</span>
              <span style={{ fontWeight: 600, color: queueLoad > 70 ? "var(--coral-400)" : "var(--amber-600)" }}>
                {queueLoad > 70 ? "High" : queueLoad > 40 ? "Moderate" : "Low"} ({queueLoad}%)
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${queueLoad}%`,
                  background: "linear-gradient(90deg, var(--teal-400), var(--amber-400))"
                }}
              />
            </div>
            <div className="queue-item">
              <span className="q-label">🔥 In Progress</span>
              <span className="q-val" style={{ color: "var(--amber-400)" }}>{preparing}</span>
            </div>
            <div className="queue-item">
              <span className="q-label">⏳ Waiting</span>
              <span className="q-val" style={{ color: "var(--coral-400)" }}>{pending}</span>
            </div>
            <div className="queue-item">
              <span className="q-label">✅ Completed</span>
              <span className="q-val" style={{ color: "var(--green-500)" }}>{readyCount + orders.filter(o => o.status === "served").length}</span>
            </div>
            <div className="queue-item">
              <span className="q-label">📋 Total Today</span>
              <span className="q-val" style={{ color: "var(--teal-600)" }}>{orders.length}</span>
            </div>
          </div>

          {/* Popular Today */}
          <div className="dash-panel">
            <div className="dash-panel-title">Popular Today</div>
            {POPULAR.map((item, i) => (
              <div className="pop-item" key={item.name}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="pop-rank">{i + 1}</div>
                  <span style={{ fontSize: 13 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal-600)" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
