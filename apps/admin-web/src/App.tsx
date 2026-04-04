/**
 * Admin app — owner login, then sidebar shell layout.
 * Kitchen Display opens the standalone kitchen-web app (port 5174) in a new tab.
 */

import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "./hooks/useAdminAuth";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import TablesQr from "./pages/TablesQr";

/** URL of the standalone Kitchen Display System app */
const KDS_URL = import.meta.env.VITE_KDS_URL ?? "http://localhost:5174";

type Tab = "dashboard" | "kitchen" | "menu" | "tables" | "analytics" | "settings";

const NAV_ITEMS: { key: Tab; label: string; icon: string; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📈" },
  { key: "kitchen", label: "Kitchen Display", icon: "🍳" },
  { key: "menu", label: "Menu Management", icon: "📋" },
  { key: "tables", label: "QR Codes", icon: "🔲" },
  { key: "analytics", label: "Analytics", icon: "📊" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  const { user, token, login, logout, isAuthenticated } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const activeLabel = useMemo(() => {
    const found = NAV_ITEMS.find((t) => t.key === tab);
    return found?.label ?? "Admin";
  }, [tab]);

  if (!isAuthenticated || !token) {
    return <AdminLogin login={login} />;
  }


  const initials = (user?.name ?? "OW")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sb-brand">QRMEAL</div>

        <div className="sb-nav">
          {NAV_ITEMS.map(({ key, label, icon, badge }) => (
            <button
              key={key}
              type="button"
              id={`nav-${key}`}
              className={`sb-item${tab === key ? " active" : ""}`}
              onClick={() => {
                if (key === "kitchen") { window.open(KDS_URL, "_blank", "noopener,noreferrer"); }
                else { setTab(key); }
              }}
            >
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{icon}</span>
              {label}
              {badge && <span className="sb-badge">{badge}</span>}
            </button>
          ))}
        </div>

        {/* Footer user block */}
        <div className="sb-footer-user">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div>
              <div className="sb-name">{user?.name ?? "Owner"}</div>
              <div className="sb-role">Restaurant Owner</div>
            </div>
          </div>
          <button
            type="button"
            className="sb-item"
            style={{ color: "var(--coral-400)", marginTop: 12 }}
            onClick={logout}
          >
            <span style={{ width: 20, textAlign: "center" }}>🚪</span>
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{activeLabel}</div>
          <div className="topbar-meta">
            <span className="topbar-chip">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="topbar-chip">{user?.name ?? "Owner"}</span>
          </div>
        </div>

        <div className="main-inner">
          {tab === "dashboard" && <Dashboard />}
          {tab === "menu" && <MenuManagement token={token} />}
          {tab === "tables" && <TablesQr token={token} />}
          {tab === "analytics" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--slate-400)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Analytics</div>
              <div style={{ fontSize: 14 }}>Coming soon — detailed revenue and order reports</div>
            </div>
          )}
          {tab === "settings" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--slate-400)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Settings</div>
              <div style={{ fontSize: 14 }}>Coming soon — restaurant profile and configurations</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
