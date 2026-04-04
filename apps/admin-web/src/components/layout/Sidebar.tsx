import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";

const KDS_URL = import.meta.env.VITE_KDS_URL ?? "http://localhost:5174";

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",        icon: "📈", path: "/dashboard" },
  { key: "kitchen",    label: "Kitchen Display",  icon: "🍴", path: "external" },
  { key: "menu",       label: "Menu Management",  icon: "📋", path: "/menu" },
  { key: "tables",     label: "QR Codes",         icon: "🔲", path: "/tables" },
  { key: "analytics",  label: "Analytics",        icon: "📊", path: "/analytics" },
  { key: "settings",   label: "Settings",         icon: "⚙️", path: "/settings" },
];

export default function Sidebar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const dispatch = useDispatch();

  const initials = (user?.name ?? "OW")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleKdsOpen = () => {
    window.open(KDS_URL, "_blank", "noopener,noreferrer");
  };

  const handleLogout = () => {
    // We will clear cookie via backend or just rely on state logout
    dispatch(logout());
  };

  if (!sidebarOpen) return null;

  return (
    <nav className="sidebar">
      <div className="sb-brand">QRMEAL</div>

      <div className="sb-nav">
        {NAV_ITEMS.map(({ key, label, icon, path }) => (
          path === "external" ? (
            <button
              key={key}
              type="button"
              className="sb-item"
              onClick={handleKdsOpen}
            >
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ) : (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
            >
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          )
        ))}
      </div>

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
          className="sb-item logout-btn"
          onClick={handleLogout}
        >
          <span style={{ width: 20, textAlign: "center" }}>🚪</span>
          Log out
        </button>
      </div>
    </nav>
  );
}
