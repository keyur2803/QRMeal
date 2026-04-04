import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import Layout from "./layout/Layout";

function BrandLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--slate-50)', zIndex: 9999
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--teal-50), var(--teal-100))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 24,
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        🍽️
      </div>
      <div className="animate-in" style={{
        fontSize: 22, fontWeight: 800,
        color: 'var(--teal-600)', letterSpacing: 2,
        marginBottom: 10, textAlign: 'center'
      }}>
        THE GOURMET KITCHEN
      </div>
      <div style={{
        fontSize: 14, color: 'var(--slate-400)',
        fontWeight: 500, letterSpacing: 1,
        animation: 'blink 1.5s ease-in-out infinite'
      }}>
        Preparing your kitchen...
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return <BrandLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
