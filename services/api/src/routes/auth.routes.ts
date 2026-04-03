/**
 * Staff authentication endpoints.
 *
 * POST /auth/login  — email + password login for owner / kitchen staff
 */

import { Router } from "express";
import * as authService from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  try {
    const result = await authService.loginStaff(email, password);
    return res.json(result);
  } catch {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});
