/**
 * Admin Login Page
 * Uses centralized Redux auth state and httpOnly cookie-based login.
 */

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginStaff } from "../api/auth";
import { setUser } from "../store/slices/authSlice";
import "../styles/login.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("owner@qrmeal.dev");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginStaff(email, password);
      // Update Redux state
      dispatch(setUser(data.user));
      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // apiClient already handles toast.error, but we can set local state if needed
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-brand">QRMEAL</h1>
        <p className="login-subtitle">Owner sign-in</p>

        <div className="login-group">
          <label className="login-label">Email</label>
          <input
            type="email"
            autoComplete="username"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="owner@qrmeal.dev"
          />
        </div>

        <div className="login-group">
          <label className="login-label">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="login-footer">
          Dev seed: owner@qrmeal.dev / owner123
        </p>
      </form>
    </div>
  );
}
