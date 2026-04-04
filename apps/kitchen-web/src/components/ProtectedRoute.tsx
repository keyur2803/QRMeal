import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { API_BASE } from "../config/env";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, { credentials: "include" });
        if (res.ok) {
          if (mounted) setIsAuthenticated(true);
        } else {
          if (mounted) setIsAuthenticated(false);
        }
      } catch (err) {
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#f8fafc" }}>
        Loading KDS...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
