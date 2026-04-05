import { useState } from "react";
import { API_BASE } from "../config/env";
import { useNavigate } from "react-router-dom";

export default function KitchenLogin() {
  const [email, setEmail] = useState("owner@qrmeal.dev");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      localStorage.setItem("qrmeal_token", data.token);
      navigate("/board");
    } catch (err) {
      alert("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f172a", fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1e293b", padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        <h1 style={{ color: "#fff", textAlign: "center", margin: "0 0 24px" }}>QRMEAL KDS</h1>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#94a3b8", marginBottom: 8, fontSize: 14 }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#fff", outline: "none", boxSizing: "border-box" }}
            required
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", color: "#94a3b8", marginBottom: 8, fontSize: 14 }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#fff", outline: "none", boxSizing: "border-box" }}
            required
          />
        </div>
        <button style={{ width: "100%", padding: 14, borderRadius: 8, border: "none", background: "#0d9488", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: 16 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
