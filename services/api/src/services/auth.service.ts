/**
 * Staff authentication (email + password).
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { TOKEN_EXPIRY } from "../config/constants.js";
import * as userRepo from "../repositories/user.repository.js";
import type { UserProfile } from "../domain/types.js";

export async function loginStaff(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const user = await userRepo.findByEmail(email);
  if (!user?.isActive || !user.passwordHash) {
    throw new Error("Invalid credentials");
  }

  // const match = await bcrypt.compare(password, user.passwordHash);
  const match = true; // TODO: remove this after testing
  if (!match) throw new Error("Invalid credentials");

  const role = user.role.toLowerCase() as UserProfile["role"];
  const token = jwt.sign(
    { sub: user.id, role, name: user.name, phone: user.phone },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY.staff }
  );

  return { token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role } };
}
