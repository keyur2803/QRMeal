/**
 * Admin app — owner login, then tabbed shell.
 */

import { useState } from "react";
import { useAdminAuth } from "./hooks/useAdminAuth";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import TablesQr from "./pages/TablesQr";
import { colors } from "./styles/tokens";

type Tab = "dashboard" | "menu" | "tables";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "menu", label: "Menu" },
  { key: "tables", label: "Tables & QR" }
];

export default function App() {
  const { user, token, login, logout, isAuthenticated } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!isAuthenticated || !token) {
    return <AdminLogin login={login} />;
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: colors.slate50 }}>
      <header
        style={{
          background: colors.white,
          borderBottom: `1px solid ${colors.slate200}`,
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.teal600, letterSpacing: 2 }}>QRMEAL</div>
          <div style={{ fontSize: 13, color: colors.slate500 }}>{user?.name} · Owner</div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${colors.slate200}`,
            background: colors.white,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          Log out
        </button>
      </header>

      <div style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: tab === key ? `2px solid ${colors.teal600}` : `1px solid ${colors.slate200}`,
                background: tab === key ? colors.teal50 : colors.white,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <Dashboard />}
        {tab === "menu" && <MenuManagement token={token} />}
        {tab === "tables" && <TablesQr />}
      </div>
    </div>
  );
}
