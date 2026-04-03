/**
 * LocalStorage helpers for auth session persistence.
 */

import type { CustomerUser } from "../types/user";

const TOKEN_KEY = "qrmeal_customer_token";
const USER_KEY = "qrmeal_customer_user";

export function saveSession(token: string, user: CustomerUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadStoredUser(): CustomerUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CustomerUser) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
