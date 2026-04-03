/**
 * Application-wide constants.
 */

/** Static OTP accepted during development. Replace with real SMS provider in prod. */
export const STATIC_OTP = "1234";

/** Token expiry durations */
export const TOKEN_EXPIRY = {
  staff: "8h",
  customer: "30d",
  pendingProfile: "15m"
} as const;

/** Valid order status transitions (lowercase API values) */
export const ALLOWED_ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled"
] as const;
