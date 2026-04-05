import { useState, useEffect, useRef } from "react";
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
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  marginBottom: 12,
  transition: "all 0.2s ease",
  boxSizing: "border-box"
};

const otpBoxStyle: React.CSSProperties = {
  width: 54,
  height: 64,
  fontSize: 28,
  fontWeight: 700,
  textAlign: "center",
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  background: "#fff",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  outline: "none",
};

const btnStyle = (loading: boolean, disabled: boolean = false): React.CSSProperties => ({
  width: "100%",
  padding: "14px",
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 12,
  border: "none",
  background: loading || disabled ? "#94a3b8" : "#0d9488",
  color: "#fff",
  cursor: loading || disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s ease",
  boxShadow: loading || disabled ? "none" : "0 4px 12px rgba(13, 148, 136, 0.2)"
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 8
};

// ── Component ──────────────────────────────────────────────────────

export default function CustomerLogin({ onLoggedIn }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  function handleError(err: unknown) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  }

  async function handleSendOtp(e: React.FormEvent | null) {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setError(null);
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) return;
    
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(email, code);
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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").trim();
    if (data.length === 4 && /^\d+$/.test(data)) {
      setOtp(data.split(""));
      otpRefs[3].current?.focus();
    }
  };

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingToken || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await completeProfile(pendingToken, name.trim(), phone.trim() || undefined);
      saveSession(res.token, res.user);
      onLoggedIn(res.user);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "40px auto", padding: "32px 24px", background: "#fff", borderRadius: 24, boxShadow: "0 10px 40px rgba(15, 23, 42, 0.05)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome to QRMEAL</h1>
        <p style={{ color: "#64748b", fontSize: 15, fontWeight: 500 }}>
          {step === "phone" ? "Enter your email to get started" : step === "otp" ? "We've sent a code to your email" : "Complete your profile"}
        </p>
      </div>

      <ErrorBanner message={error} />

      {step === "phone" && (
        <form onSubmit={handleSendOtp}>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Sending..." : "Continue"}
          </button>
          <div style={{ marginTop: 24, padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              Use a real email to receive your **4-digit OTP** and order invoices.
            </p>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
             <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>
              Sent to <strong style={{ color: "#1e293b" }}>{email}</strong>
            </p>
            <button
               type="button"
               onClick={() => { setStep("phone"); setOtp(["", "", "", ""]); }}
               style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Edit
            </button>
          </div>

          <div 
            style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, marginTop: 12 }}
            onPaste={handlePaste}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  ...otpBoxStyle,
                  borderColor: digit ? "#0d9488" : "#e2e8f0",
                  boxShadow: digit ? "0 0 0 3px rgba(13, 148, 136, 0.1)" : "none"
                }}
                required
              />
            ))}
          </div>

          <button type="submit" disabled={loading || otp.some(d => !d)} style={btnStyle(loading, otp.some(d => !d))}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Didn't receive code?{" "}
              {resendTimer > 0 ? (
                <span style={{ fontWeight: 700, color: "#94a3b8" }}>Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp(null)}
                  style={{ fontWeight: 700, color: "#0d9488", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfile}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Your full name</label>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Mobile number <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Saving..." : "Start Ordering"}
          </button>
        </form>
      )}
    </div>
  );
}
