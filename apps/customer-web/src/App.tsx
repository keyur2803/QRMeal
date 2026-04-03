/**
 * Customer app shell.
 * Shows login if unauthenticated, otherwise the main tabbed UI.
 */

import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { useAuth } from "./hooks/useAuth";
import CustomerLogin from "./pages/CustomerLogin";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";

type Tab = "menu" | "checkout" | "status";

export default function App() {
  const { user, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("menu");
  /** Table QR code — default matches seed `T-DEMO`. */
  const [tableCode, setTableCode] = useState("T-DEMO");

  if (!user) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
        <CustomerLogin onLoggedIn={login} />
      </div>
    );
  }

  return (
    <CartProvider>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
        <header style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: "1.25rem", margin: 0 }}>QRMEAL</h1>
            <button
              type="button"
              onClick={logout}
              style={{
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              Log out
            </button>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>
            Hi, {user.name}
            {user.phone ? ` · ${user.phone}` : ""}
          </p>
          <nav style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {(
              [
                ["menu", "Menu"],
                ["checkout", "Checkout"],
                ["status", "Status"]
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: tab === key ? "2px solid #0d9488" : "1px solid #cbd5e1",
                  background: tab === key ? "#f0fdfa" : "#fff",
                  cursor: "pointer"
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>
        {tab === "menu" && <Menu tableCode={tableCode} onViewCart={() => setTab("checkout")} />}
        {tab === "checkout" && (
          <Checkout
            tableCode={tableCode}
            onTableCodeChange={setTableCode}
            customerName={user.name}
            onOrderPlaced={() => setTab("status")}
          />
        )}
        {tab === "status" && <OrderStatus />}
      </div>
    </CartProvider>
  );
}
