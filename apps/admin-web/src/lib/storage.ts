/**
 * LocalStorage helpers for admin/staff auth session.
 */

const TOKEN_KEY = "qrmeal_admin_token";
const USER_KEY = "qrmeal_admin_user";

type StaffUser = { id: string; name: string; role: string };

export function saveStaffSession(token: string, user: StaffUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadStaffUser(): StaffUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  } catch {
    return null;
  }
}

export function getStaffToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStaffSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
