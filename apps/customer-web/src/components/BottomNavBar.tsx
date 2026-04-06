import { colors, radius } from "../styles/tokens";
import type { CustomerUser } from "../types/user";

export type BottomNavTab = "menu" | "cart" | "history" | "account";

type Props = {
  activeTab: BottomNavTab;
  accountOpen: boolean;
  user: CustomerUser | null;
  onMenu: () => void;
  onCart: () => void;
  onHistory: () => void;
  onToggleAccount: () => void;
  onLogin: () => void;
  onLogout: () => void;
};

export default function BottomNavBar({
  activeTab,
  accountOpen,
  user,
  onMenu,
  onCart,
  onHistory,
  onToggleAccount,
  onLogin,
  onLogout
}: Props) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 480,
          margin: "0 auto",
          borderTop: `1px solid ${colors.slate200}`,
          background: colors.white,
          boxShadow: "0 -8px 20px rgba(15,23,42,0.06)",
          zIndex: 25,
          padding: "8px 12px calc(8px + env(safe-area-inset-bottom))"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 }}>
          <button
            type="button"
            onClick={onMenu}
            style={{ border: "none", background: "transparent", padding: "8px 0", color: activeTab === "menu" ? colors.teal600 : colors.slate500, fontSize: 12, fontWeight: activeTab === "menu" ? 700 : 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <span style={{ fontSize: 17 }}>🍽️</span>
            Menu
          </button>
          <button
            type="button"
            onClick={onCart}
            style={{ border: "none", background: "transparent", padding: "8px 0", color: activeTab === "cart" ? colors.teal600 : colors.slate500, fontSize: 12, fontWeight: activeTab === "cart" ? 700 : 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <span style={{ fontSize: 17 }}>🛒</span>
            Cart
          </button>
          <button
            type="button"
            onClick={onHistory}
            style={{ border: "none", background: "transparent", padding: "8px 0", color: activeTab === "history" ? colors.teal600 : colors.slate500, fontSize: 12, fontWeight: activeTab === "history" ? 700 : 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <span style={{ fontSize: 17 }}>🧾</span>
            History
          </button>
          <button
            type="button"
            onClick={onToggleAccount}
            style={{ border: "none", background: "transparent", padding: "8px 0", color: activeTab === "account" ? colors.teal600 : colors.slate500, fontSize: 12, fontWeight: activeTab === "account" ? 700 : 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <span style={{ fontSize: 17 }}>👤</span>
            Account
          </button>
        </div>
      </div>

      {accountOpen && (
        <div
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 74,
            maxWidth: 456,
            margin: "0 auto",
            background: colors.white,
            border: `1px solid ${colors.slate200}`,
            borderRadius: radius.lg,
            boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
            zIndex: 35,
            padding: 14
          }}
        >
          {user ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.slate900, marginBottom: 8 }}>Account details</div>
              <div style={{ fontSize: 13, color: colors.slate600, marginBottom: 2 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: colors.slate500, marginBottom: 14 }}>{user.email || user.phone || "Guest user"}</div>
              <button
                type="button"
                onClick={onLogout}
                style={{ width: "100%", height: 38, borderRadius: radius.md, border: `1px solid ${colors.slate200}`, background: colors.white, color: colors.slate700, fontWeight: 700, cursor: "pointer" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.slate900, marginBottom: 8 }}>Account</div>
              <div style={{ fontSize: 13, color: colors.slate500, marginBottom: 14 }}>Login to view your details and orders.</div>
              <button
                type="button"
                onClick={onLogin}
                style={{ width: "100%", height: 38, borderRadius: radius.md, border: "none", background: colors.teal600, color: colors.white, fontWeight: 700, cursor: "pointer" }}
              >
                Login
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
