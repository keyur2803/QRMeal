/**
 * Serializers convert Prisma DB rows into API-level DTOs.
 * Keeps DB schema details out of routes and services.
 */

import type { Order, OrderItem, OrderStatusHistory, Table } from "@prisma/client";
import type { OrderDto, OrderItemDto, OrderStatus } from "./types.js";

// ── Prisma order with relations (used by repository layer) ────────

export type OrderWithRelations = Order & {
  items: OrderItem[];
  table: Table;
  statusHistory: OrderStatusHistory[];
};

// ── Helpers ────────────────────────────────────────────────────────

/** Prisma stores enums in UPPER_CASE; API uses lower_case. */
export function toLowerStatus(s: string): OrderStatus {
  return s.toLowerCase() as OrderStatus;
}

/** Convert API lowercase status back to Prisma enum value. */
export function toUpperStatus(s: OrderStatus): string {
  return s.toUpperCase();
}

// ── Order serializer ──────────────────────────────────────────────

export function serializeOrder(o: OrderWithRelations): OrderDto {
  const items: OrderItemDto[] = o.items.map((i) => ({
    name: i.itemName,
    price: Number(i.unitPrice),
    qty: i.qty
  }));

  return {
    id: o.id,
    orderCode: o.orderCode,
    table: o.table.code,
    customerName: o.customerName ?? "Guest",
    items,
    status: toLowerStatus(o.status),
    total: Number(o.totalAmount),
    history: o.statusHistory.map((h) => ({
      from: h.fromStatus ? toLowerStatus(h.fromStatus) : null,
      to: toLowerStatus(h.toStatus),
      at: h.changedAt.toISOString()
    })),
    createdAt: o.createdAt.toISOString()
  };
}
