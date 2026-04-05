/**
 * Customer OTP authentication endpoints.
 *
 * POST /auth/customer/send-otp         — request OTP for mobile number
 * POST /auth/customer/verify-otp       — validate OTP, return token or pending-profile flag
 * POST /auth/customer/complete-profile — create new customer after OTP verification
 */

import { Router } from "express";
import * as customerAuthService from "../services/customer-auth.service.js";
import { sendOtpEmail } from "../services/email.service.js";
import * as otpRepo from "../repositories/otp.repository.js";

export const customerAuthRouter = Router();

function generateOtp(length: number = 4): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

customerAuthRouter.post("/send-otp", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  const otp = generateOtp(4);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    await otpRepo.createOtp(email, otp, expiresAt);
    await sendOtpEmail(email, otp);
    return res.json({
      ok: true,
      message: "OTP sent to your email"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to send email" });
  }
});

customerAuthRouter.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    return res.status(400).json({ message: "email and otp required" });
  }

  const isValid = await customerAuthService.verifyOtpCode(email, otp);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  const result = await customerAuthService.authenticateByEmail(email);
  return res.json(result);
});

customerAuthRouter.post("/complete-profile", async (req, res) => {
  const { pendingToken, name, phone } = req.body as {
    pendingToken?: string;
    name?: string;
    phone?: string;
  };

  if (!pendingToken || !name?.trim()) {
    return res.status(400).json({ message: "pendingToken and name are required" });
  }

  try {
    const result = await customerAuthService.completeProfile(pendingToken, name, phone);
    return res.status(201).json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Profile creation failed";
    return res.status(400).json({ message: msg });
  }
});
