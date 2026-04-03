/**
 * Customer OTP authentication endpoints.
 *
 * POST /auth/customer/send-otp         — request OTP for mobile number
 * POST /auth/customer/verify-otp       — validate OTP, return token or pending-profile flag
 * POST /auth/customer/complete-profile — create new customer after OTP verification
 */

import { Router } from "express";
import { env } from "../config/env.js";
import { STATIC_OTP } from "../config/constants.js";
import * as customerAuthService from "../services/customer-auth.service.js";

export const customerAuthRouter = Router();

customerAuthRouter.post("/send-otp", async (req, res) => {
  const { phone: raw } = req.body as { phone?: string };
  const phone = raw ? customerAuthService.normalizePhone(raw) : null;

  if (!phone) {
    return res.status(400).json({ message: "Enter a valid mobile number (10-15 digits)" });
  }

  return res.json({
    ok: true,
    message: "OTP sent (demo: use 1234)",
    demoOtp: env.isProd ? undefined : STATIC_OTP
  });
});

customerAuthRouter.post("/verify-otp", async (req, res) => {
  const { phone: raw, otp } = req.body as { phone?: string; otp?: string };
  const phone = raw ? customerAuthService.normalizePhone(raw) : null;

  if (!phone || !otp) {
    return res.status(400).json({ message: "phone and otp required" });
  }

  if (!customerAuthService.verifyOtpCode(otp)) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const result = await customerAuthService.authenticateByPhone(phone);
  return res.json(result);
});

customerAuthRouter.post("/complete-profile", async (req, res) => {
  const { pendingToken, name, email } = req.body as {
    pendingToken?: string;
    name?: string;
    email?: string;
  };

  if (!pendingToken || !name?.trim()) {
    return res.status(400).json({ message: "pendingToken and name are required" });
  }

  try {
    const result = await customerAuthService.completeProfile(pendingToken, name, email);
    return res.status(201).json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Profile creation failed";
    const status = msg.includes("Email already in use") ? 409 : 400;
    return res.status(status).json({ message: msg });
  }
});
