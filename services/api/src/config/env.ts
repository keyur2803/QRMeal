/**
 * Centralised environment config.
 * Import this instead of reading process.env directly in business logic.
 */

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  isProd: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
} as const;
