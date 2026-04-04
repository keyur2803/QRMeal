/**
 * Customer authentication API client.
 * Uses the standardized `apiClient` for toast-based error notifications.
 */

import { apiClient } from "../lib/api-client";

type SendOtpResponse = { ok: boolean; message: string; demoOtp?: string };

type VerifyOtpResponse =
  | { needsProfile: false; token: string; user: { id: string; name: string; phone: string | null; email: string | null; role: string } }
  | { needsProfile: true; pendingToken: string; phone: string };

type CompleteProfileResponse = {
  token: string;
  user: { id: string; name: string; phone: string | null; email: string | null; role: string };
};

export function sendOtp(phone: string) {
  return apiClient<SendOtpResponse>("/auth/customer/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export function verifyOtp(phone: string, otp: string) {
  return apiClient<VerifyOtpResponse>("/auth/customer/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp })
  });
}

export function completeProfile(pendingToken: string, name: string, email: string | undefined) {
  return apiClient<CompleteProfileResponse>("/auth/customer/complete-profile", {
    method: "POST",
    body: JSON.stringify({
      pendingToken,
      name,
      email: email || undefined
    })
  });
}
