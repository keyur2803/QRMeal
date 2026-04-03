/**
 * Owner login — uses POST /auth/login (seed: owner@qrmeal.dev / owner123).
 */

import { useState } from "react";
import { colors, radius } from "../styles/tokens";

type Props = { login: (email: string, password: string) => Promise<unknown> };

export default function AdminLogin({ login }: Props) {
  const [email, setEmail] = useState("owner@qrmeal.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: colors.slate50
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          background: colors.white,
          padding: 28,
          borderRadius: radius.lg,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
        }}
      >
        <h1 style={{ fontSize: "1.35rem", marginBottom: 4, color: colors.teal600, fontWeight: 800, letterSpacing: 2 }}>
          QRMEAL
        </h1>
        <p style={{ fontSize: 14, color: colors.slate500, marginBottom: 20 }}>Owner sign-in</p>

        {error && (
          <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 10, borderRadius: radius.md, marginBottom: 14, fontSize: 14 }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.slate700 }}>Email</label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: radius.md,
            border: `1px solid ${colors.slate200}`,
            marginBottom: 14,
            fontSize: 15,
            boxSizing: "border-box"
          }}
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.slate700 }}>Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: radius.md,
            border: `1px solid ${colors.slate200}`,
            marginBottom: 20,
            fontSize: 15,
            boxSizing: "border-box"
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 16,
            fontWeight: 600,
            border: "none",
            borderRadius: radius.md,
            background: colors.teal600,
            color: colors.white,
            cursor: loading ? "wait" : "pointer"
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p style={{ fontSize: 12, color: colors.slate400, marginTop: 14 }}>Dev seed: owner@qrmeal.dev / owner123</p>
      </form>
    </div>
  );
}
