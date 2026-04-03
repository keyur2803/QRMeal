/**
 * Multi-step customer login page.
 * Flow: enter phone → verify OTP → (if new user) complete profile.
 */

import { useState } from "react";
import { sendOtp, verifyOtp, completeProfile } from "../api/auth";
import { saveSession } from "../lib/storage";
import ErrorBanner from "../components/ErrorBanner";
import type { CustomerUser } from "../types/user";

type Props = { onLoggedIn: (user: CustomerUser) => void };
type Step = "phone" | "otp" | "profile";

// ── Shared inline styles ───────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 16,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  marginBottom: 12,
  boxSizing: "border-box"
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 10,
  border: "none",
  background: "#0d9488",
  color: "#fff",
  cursor: loading ? "wait" : "pointer"
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6
};

// ── Component ──────────────────────────────────────────────────────

export default function CustomerLogin({ onLoggedIn }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleError(err: unknown) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (!res.needsProfile) {
        saveSession(res.token, res.user);
        onLoggedIn(res.user);
        return;
      }
      setPendingToken(res.pendingToken);
      setStep("profile");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingToken || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await completeProfile(pendingToken, name.trim(), email.trim() || undefined);
      saveSession(res.token, res.user);
      onLoggedIn(res.user);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: "1.35rem", marginBottom: 4 }}>Welcome to QRMEAL</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Sign in with your mobile number</p>

      <ErrorBanner message={error} />

      {step === "phone" && (
        <form onSubmit={handleSendOtp}>
          <label style={labelStyle}>Mobile number</label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ ...inputStyle, marginBottom: 16 }}
          />
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Sending\u2026" : "Send OTP"}
          </button>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
            Demo: valid OTP is <strong>1234</strong>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            Code sent to <strong>{phone}</strong>
          </p>
          <label style={labelStyle}>Enter OTP</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="1234"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ ...inputStyle, fontSize: 20, letterSpacing: 6, marginBottom: 16 }}
          />
          <button type="submit" disabled={loading} style={{ ...btnStyle(loading), marginBottom: 8 }}>
            {loading ? "Checking\u2026" : "Verify & continue"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("phone"); setOtp(""); }}
            style={{ width: "100%", padding: 8, fontSize: 14, background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
          >
            Change number
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfile}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>New here — tell us your name to finish signup.</p>
          <label style={labelStyle}>Your name</label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <label style={labelStyle}>
            Email <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...inputStyle, marginBottom: 16 }}
          />
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Saving\u2026" : "Continue"}
          </button>
        </form>
      )}
    </div>
  );
}
