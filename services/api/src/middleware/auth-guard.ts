/**
 * JWT authentication middleware.
 * Attaches decoded token payload to `req.user` for downstream handlers.
 *
 * Usage:
 *   router.get("/protected", requireAuth("owner", "kitchen"), handler);
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  sub: string;
  role: string;
  name: string;
  phone?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/** Require a valid JWT. Optionally restrict to specific roles. */
export function requireAuth(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    try {
      const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
