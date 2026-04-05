/**
 * Admin App Entry Point
 * Handles global providers (Redux), Routing, and Notifications.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import type { AppDispatch, RootState } from "./store";
import { checkAuth } from "./store/slices/authSlice";
import { useSelector } from "react-redux";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import TablesQr from "./pages/TablesQr";
import WaiterApp from "./pages/WaiterApp";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Waiter specific route */}
        <Route path="/waiter" element={user?.role === "waiter" ? <WaiterApp /> : <Navigate to="/dashboard" replace />} />
        
        {/* Admin only routes */}
        <Route path="/dashboard" element={user?.role === "waiter" ? <Navigate to="/waiter" replace /> : <Dashboard />} />
        <Route path="/menu" element={user?.role === "waiter" ? <Navigate to="/waiter" replace /> : <MenuManagement />} />
        <Route path="/tables" element={user?.role === "waiter" ? <Navigate to="/waiter" replace /> : <TablesQr />} />
        
        {/* Placeholder for future features */}
        <Route path="/analytics" element={user?.role === "waiter" ? <Navigate to="/waiter" replace /> : <Placeholder title="Analytics" icon="📊" />} />
        <Route path="/settings" element={user?.role === "waiter" ? <Navigate to="/waiter" replace /> : <Placeholder title="Settings" icon="⚙️" />} />
        
        {/* Default redirect for authenticated users */}
        <Route path="/" element={<Navigate to={user?.role === "waiter" ? "/waiter" : "/dashboard"} replace />} />
      </Route>

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function Placeholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--slate-400)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14 }}>Coming soon — this feature is currently under development</div>
    </div>
  );
}

function AppRoutesWrapper() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  return <AppRoutes />;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutesWrapper />
      </BrowserRouter>
    </Provider>
  );
}
