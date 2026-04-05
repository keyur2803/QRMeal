/**
 * Staff authentication endpoints.
 *
 * POST /auth/login  — email + password login for owner / kitchen staff
 */

import { Router } from "express";
import * as authService from "../services/auth.service.js";
import { requireAuth } from "../middleware/auth-guard.js";

export const authRouter = Router();

authRouter.get("/profile", requireAuth(), (req, res) => {
  // req.user is guaranteed to exist by requireAuth middleware
  const { sub: id, name, role } = req.user!;
  return res.json({ user: { id, name, role } });
});


authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  try {
    const { token, user } = await authService.loginStaff(email, password);

    // Set JWT as httpOnly cookie
    res.cookie("qrmeal_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (align with token expiry)
    });

    return res.json({ user, token });
  } catch {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("qrmeal_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.json({ message: "Logged out successfully" });
});
