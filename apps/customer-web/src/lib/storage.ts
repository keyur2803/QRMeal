/**
 * LocalStorage helpers for auth session persistence.
 */

import type { CustomerUser } from "../types/user";

const TOKEN_KEY = "qrmeal_customer_token";
const USER_KEY = "qrmeal_customer_user";
const ACTIVE_ORDER_KEY = "qrmeal_active_order";
const WELCOME_SEEN_KEY = "qrmeal_welcome_seen";

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

export type ActiveOrder = {
  id: string;
  orderCode: string;
  table: string;
};

export function saveActiveOrder(order: ActiveOrder): void {
  localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(order));
}

export function loadActiveOrder(): ActiveOrder | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    return raw ? (JSON.parse(raw) as ActiveOrder) : null;
  } catch {
    return null;
  }
}

export function clearActiveOrder(): void {
  localStorage.removeItem(ACTIVE_ORDER_KEY);
}

export function saveWelcomeSeen(): void {
  localStorage.setItem(WELCOME_SEEN_KEY, "1");
}

export function loadWelcomeSeen(): boolean {
  return localStorage.getItem(WELCOME_SEEN_KEY) === "1";
}
