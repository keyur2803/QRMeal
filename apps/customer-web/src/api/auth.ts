/**
 * Customer authentication API client.
 * Talks to POST /auth/customer/* endpoints on the backend.
 */

import { API_BASE } from "../config/env";

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Generic helper — throws on non-2xx with backend error message. */
async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Request failed");
  return data as T;
}

// ── Response shapes ────────────────────────────────────────────────

type SendOtpResponse = { ok: boolean; message: string; demoOtp?: string };

type VerifyOtpResponse =
  | { needsProfile: false; token: string; user: { id: string; name: string; phone: string | null; email: string | null; role: string } }
  | { needsProfile: true; pendingToken: string; phone: string };

type CompleteProfileResponse = {
  token: string;
  user: { id: string; name: string; phone: string | null; email: string | null; role: string };
};

// ── API functions ──────────────────────────────────────────────────

export function sendOtp(phone: string) {
  return request<SendOtpResponse>("/auth/customer/send-otp", { phone });
}

export function verifyOtp(phone: string, otp: string) {
  return request<VerifyOtpResponse>("/auth/customer/verify-otp", { phone, otp });
}

export function completeProfile(pendingToken: string, name: string, email: string | undefined) {
  return request<CompleteProfileResponse>("/auth/customer/complete-profile", {
    pendingToken,
    name,
    email: email || undefined
  });
}
