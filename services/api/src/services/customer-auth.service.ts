/**
 * Customer OTP-based authentication.
 * In production, replace STATIC_OTP check with an SMS gateway call.
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { STATIC_OTP, TOKEN_EXPIRY } from "../config/constants.js";
import * as userRepo from "../repositories/user.repository.js";
import type { UserProfile } from "../domain/types.js";

// ── Helpers ────────────────────────────────────────────────────────

/** Strip non-digits and validate length. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function signAccessToken(user: { id: string; name: string; phone: string | null }) {
  return jwt.sign(
    { sub: user.id, role: "customer", name: user.name, phone: user.phone },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY.customer }
  );
}

function buildProfile(u: { id: string; name: string; phone: string | null; email: string | null }): UserProfile {
  return { id: u.id, name: u.name, phone: u.phone, email: u.email, role: "customer" };
}

// ── Service methods ───────────────────────────────────────────────

export function verifyOtpCode(otp: string): boolean {
  return otp === STATIC_OTP;
  //TODO: In production, replace STATIC_OTP check with an SMS gateway call
  //TODO: Add OTP verification logic
}

/**
 * After OTP verified: return session if user exists,
 * or a short-lived pending token so the client can collect name/email.
 */
export async function authenticateByPhone(phone: string) {
  const user = await userRepo.findCustomerByPhone(phone);

  if (user) {
    return {
      needsProfile: false as const,
      token: signAccessToken({ id: user.id, name: user.name, phone: user.phone }),
      user: buildProfile(user)
    };
  }

  const pendingToken = jwt.sign(
    { purpose: "customer_pending", phone },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY.pendingProfile }
  );

  return { needsProfile: true as const, pendingToken, phone };
}

/** Verify the pending token, create user, return access token. */
export async function completeProfile(pendingToken: string, name: string, email: string | undefined) {
  let payload: { purpose?: string; phone?: string };
  try {
    payload = jwt.verify(pendingToken, env.jwtSecret) as typeof payload;
  } catch {
    throw new Error("Invalid or expired session. Start again.");
  }

  if (payload.purpose !== "customer_pending" || !payload.phone) {
    throw new Error("Invalid session");
  }

  const phone = payload.phone;

  // Race-condition guard: user may have been created between steps
  const existing = await userRepo.findCustomerByPhone(phone);
  if (existing) {
    return {
      token: signAccessToken({ id: existing.id, name: existing.name, phone: existing.phone }),
      user: buildProfile(existing)
    };
  }

  const emailTrim = email?.trim() || null;
  if (emailTrim) {
    const clash = await userRepo.findByEmailAny(emailTrim);
    if (clash) throw new Error("Email already in use");
  }

  const user = await userRepo.createCustomer({ name: name.trim(), phone, email: emailTrim });

  return {
    token: signAccessToken({ id: user.id, name: user.name, phone: user.phone }),
    user: buildProfile(user)
  };
}
