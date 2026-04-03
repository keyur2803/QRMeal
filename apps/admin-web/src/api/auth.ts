/**
 * Staff authentication API client.
 */

import { API_BASE } from "../config/env";

type LoginResponse = {
  token: string;
  user: { id: string; name: string; role: string };
};

export async function loginStaff(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Login failed");
  return data as LoginResponse;
}
