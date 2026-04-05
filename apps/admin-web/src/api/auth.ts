/**
 * Staff authentication API client.
 */

import { apiClient } from "../lib/api-client";

type LoginResponse = {
  user: { id: string; name: string; role: string };
  token: string;
};

export async function loginStaff(email: string, password: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

/**
 * Verifies current session (by sending the cookie)
 */
export async function getProfile(): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/profile");
}
