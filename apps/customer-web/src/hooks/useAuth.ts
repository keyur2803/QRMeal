/**
 * Auth state hook.
 * Wraps session load/clear so components don't touch storage directly.
 */

import { useCallback, useState } from "react";
import type { CustomerUser } from "../types/user";
import { loadStoredUser, clearSession } from "../lib/storage";

export function useAuth() {
  const [user, setUser] = useState<CustomerUser | null>(() => loadStoredUser());

  /** Called after CustomerLogin saves the session. */
  const login = useCallback((userData: CustomerUser) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, login, logout } as const;
}
