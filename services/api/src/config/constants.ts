/**
 * Application-wide constants.
 */

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
