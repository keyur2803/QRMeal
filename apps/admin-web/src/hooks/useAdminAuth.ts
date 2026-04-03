/**
 * Owner/staff session for admin app.
 */

import { useCallback, useState } from "react";
import { loginStaff } from "../api/auth";
import { clearStaffSession, loadStaffUser, saveStaffSession, getStaffToken } from "../lib/storage";

type StaffUser = { id: string; name: string; role: string };

export function useAdminAuth() {
  const [user, setUser] = useState<StaffUser | null>(() => loadStaffUser());
  const token = getStaffToken();

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginStaff(email, password);
    if (res.user.role !== "owner") {
      throw new Error("Owner access required for this panel");
    }
    saveStaffSession(res.token, res.user);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearStaffSession();
    setUser(null);
  }, []);

  return {
    user,
    token: user ? token : null,
    login,
    logout,
    isAuthenticated: Boolean(user && token)
  };
}
