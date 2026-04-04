/**
 * Customer app shell.
 * Matches docs/design-system customer screens: welcome → login → menu → cart → status → add more.
 */

import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { useAuth } from "./hooks/useAuth";
import CustomerLogin from "./pages/CustomerLogin";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import { Toaster } from "react-hot-toast";
import Welcome from "./pages/Welcome";
import AddMore from "./pages/AddMore";
import {
  clearActiveOrder,
  loadActiveOrder,
  loadWelcomeSeen,
  saveWelcomeSeen,
  saveActiveOrder,
} from "./lib/storage";

function initialTableCode(): string {
  try {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("table") || url.searchParams.get("t");
    return raw?.trim() ? raw.trim().toUpperCase() : "T-DEMO";
  } catch {
    return "T-DEMO";
  }
}

function RouteHome() {
  const activeOrder = loadActiveOrder();
  const welcomeSeen = loadWelcomeSeen();
  if (activeOrder) return <Navigate to={`/order/${activeOrder.id}`} replace />;
  if (!welcomeSeen) return <Navigate to="/welcome" replace />;
  return <Navigate to="/menu" replace />;
}

function RouteWelcome({
  restaurantName,
  tableCode,
  guests,
}: {
  restaurantName: string;
  tableCode: string;
  guests: number;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <Welcome
      restaurantName={restaurantName}
      tableCode={tableCode.replace(/^T-?/, "")}
      guests={guests}
      onBrowseMenu={() => {
        saveWelcomeSeen();
        navigate(user ? "/menu" : "/login");
      }}
    />
  );
}

function RouteLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <CustomerLogin
        onLoggedIn={(u) => {
          login(u);
          const activeOrder = loadActiveOrder();
          navigate(activeOrder ? `/order/${activeOrder.id}` : "/menu", {
            replace: true,
          });
        }}
      />
    </div>
  );
}

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const activeOrder = loadActiveOrder();

  return (
    <CartProvider>
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: 16,
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/menu")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 900,
              color: "#0d9488",
              letterSpacing: 3,
            }}
          >
            QRMEAL
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {activeOrder && (
              <button
                type="button"
                onClick={() => navigate(`/order/${activeOrder.id}`)}
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Order
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/cart")}
              style={{
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cart
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/menu", { replace: true });
                }}
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
        <Outlet />
      </div>
    </CartProvider>
  );
}

function RouteMenu({ tableCode }: { tableCode: string }) {
  const navigate = useNavigate();
  return <Menu tableCode={tableCode} onViewCart={() => navigate("/cart")} />;
}

function RouteCart({ tableCode }: { tableCode: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <Checkout
      tableCode={tableCode}
      customerName={user?.name ?? "Guest"}
      onBack={() => navigate("/menu")}
      onAddMore={() => navigate("/menu")}
      onOrderPlaced={(order) => {
        saveActiveOrder({
          id: order.id,
          orderCode: order.orderCode,
          table: order.table,
        });
        navigate(`/order/${order.id}`, { replace: true });
      }}
    />
  );
}

function RouteOrderStatus() {
  const navigate = useNavigate();
  const params = useParams();
  const orderId = params.orderId || "";
  const activeOrder = useMemo(() => loadActiveOrder(), [orderId]);

  const orderCode =
    activeOrder?.id === orderId ? activeOrder.orderCode : orderId;
  return (
    <OrderStatus
      orderId={orderId}
      orderCode={orderCode}
      onAddMore={() => navigate(`/order/${orderId}/add-more`)}
      onBrowseMenu={() => navigate("/menu")}
      onClearOrder={() => {
        clearActiveOrder();
        navigate("/menu", { replace: true });
      }}
    />
  );
}

function RouteAddMore() {
  const navigate = useNavigate();
  const params = useParams();
  const orderId = params.orderId || "";
  const activeOrder = useMemo(() => loadActiveOrder(), [orderId]);
  const orderCode =
    activeOrder?.id === orderId ? activeOrder.orderCode : orderId;
  return (
    <AddMore
      orderId={orderId}
      orderCode={orderCode}
      onBack={() => navigate(`/order/${orderId}`)}
      onDone={() => navigate(`/order/${orderId}`)}
    />
  );
}

export default function App() {
  /** Table QR code — default matches seed `T-DEMO`. */
  const [tableCode] = useState(() => initialTableCode());

  const restaurantName = "The Gourmet Kitchen";
  const guests = 4;

  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <Routes>
          <Route path="/" element={<RouteHome />} />
          <Route
            path="/welcome"
            element={
              <RouteWelcome
                restaurantName={restaurantName}
                tableCode={tableCode}
                guests={guests}
              />
            }
          />
          <Route path="/login" element={<RouteLogin />} />

          <Route element={<AppLayout />}>
            <Route path="/menu" element={<RouteMenu tableCode={tableCode} />} />
            <Route path="/cart" element={<RouteCart tableCode={tableCode} />} />
            <Route path="/order/:orderId" element={<RouteOrderStatus />} />
            <Route path="/order/:orderId/add-more" element={<RouteAddMore />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
