/**
 * Prisma schema enums mirrored as const objects + union types.
 * Keeps repositories free of brittle `@prisma/client` enum / `$Enums` exports
 * (some TS setups report “no exported member” on generated re-exports).
 *
 * Must stay in sync with `prisma/schema.prisma` — update both when changing enums.
 */

export const OrderStatus = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  CANCELLED: "CANCELLED"
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED"
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const UserRole = {
  CUSTOMER: "CUSTOMER",
  KITCHEN: "KITCHEN",
  OWNER: "OWNER"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
