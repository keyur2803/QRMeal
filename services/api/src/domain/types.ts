/**
 * API-level domain types.
 * These represent the shape of data returned to clients —
 * intentionally decoupled from Prisma model types.
 */

// ── Enums (lowercase for JSON responses) ──────────────────────────

export type UserRole = "owner" | "kitchen" | "customer";
export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

// ── User ───────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
};

// ── Menu ───────────────────────────────────────────────────────────

export type MenuItemDto = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  /** Public URL path served by the API, e.g. /uploads/menu-items/uuid.jpg */
  imageUrl: string | null;
  price: number;
  prepTime: string;
  calories: string | null;
  dietaryTags: string[];
  customizations: string[];
  isAvailable: boolean;
};

// ── Order ──────────────────────────────────────────────────────────

export type OrderItemDto = {
  name: string;
  price: number;
  qty: number;
};

export type OrderHistoryEntry = {
  from: OrderStatus | null;
  to: OrderStatus;
  at: string;
};

export type OrderDto = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  items: OrderItemDto[];
  status: OrderStatus;
  total: number;
  history: OrderHistoryEntry[];
  createdAt: string;
};

// ── Payment ────────────────────────────────────────────────────────

export type PaymentDto = {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  paidAt: string;
};
