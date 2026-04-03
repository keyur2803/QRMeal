/**
 * Centralised environment config.
 * Import this instead of reading process.env directly in business logic.
 */

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  isProd: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? ""
} as const;
