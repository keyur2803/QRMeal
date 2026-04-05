import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { TOKEN_EXPIRY } from "../config/constants.js";
import * as userRepo from "../repositories/user.repository.js";
import * as otpRepo from "../repositories/otp.repository.js";
import type { UserProfile } from "../domain/types.js";

// ── Helpers ────────────────────────────────────────────────────────

/** Strip non-digits and validate length. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function signAccessToken(user: { id: string; name: string; email: string | null }) {
  return jwt.sign(
    { sub: user.id, role: "customer", name: user.name, email: user.email },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY.customer }
  );
}

function buildProfile(u: { id: string; name: string; email: string | null; phone: string | null }): UserProfile {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: "customer" };
}

// ── Service methods ───────────────────────────────────────────────

export async function verifyOtpCode(email: string, otp: string): Promise<boolean> {
  const latest = await otpRepo.findLatestOtp(email);
  if (!latest || latest.code !== otp) return false;

  const isExpired = new Date() > latest.expiresAt;
  if (isExpired) {
    await otpRepo.deleteOtp(latest.id);
    return false;
  }

  // Valid! Delete so it can't be reused immediately
  await otpRepo.deleteOtp(latest.id);
  return true;
}

export async function authenticateByEmail(email: string) {
  const user = await userRepo.findCustomerByEmail(email);

  if (user) {
    return {
      needsProfile: false as const,
      token: signAccessToken({ id: user.id, name: user.name, email: user.email }),
      user: buildProfile(user)
    };
  }

  const pendingToken = jwt.sign(
    { purpose: "customer_pending", email },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY.pendingProfile }
  );

  return { needsProfile: true as const, pendingToken, email };
}

/** Verify the pending token, create user, return access token. */
export async function completeProfile(pendingToken: string, name: string, phone: string | undefined) {
  let payload: { purpose?: string; email?: string };
  try {
    payload = jwt.verify(pendingToken, env.jwtSecret) as typeof payload;
  } catch {
    throw new Error("Invalid or expired session. Start again.");
  }

  if (payload.purpose !== "customer_pending" || !payload.email) {
    throw new Error("Invalid session");
  }

  const email = payload.email;

  // Race-condition guard
  const existing = await userRepo.findCustomerByEmail(email);
  if (existing) {
    return {
      token: signAccessToken({ id: existing.id, name: existing.name, email: existing.email }),
      user: buildProfile(existing)
    };
  }

  const phoneTrim = phone?.trim() || null;
  const user = await userRepo.createCustomer({ name: name.trim(), email, phone: phoneTrim });

  return {
    token: signAccessToken({ id: user.id, name: user.name, email: user.email }),
    user: buildProfile(user)
  };
}
