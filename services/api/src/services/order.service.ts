/**
 * Order business logic.
 */

import * as orderRepo from "../repositories/order.repository.js";
import * as tableRepo from "../repositories/table.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import { sendInvoiceEmail } from "./email.service.js";
import type { OrderStatus } from "../db/enums.js";
import { serializeOrder, toUpperStatus } from "../domain/serializers.js";
import { ALLOWED_ORDER_STATUSES } from "../config/constants.js";
import type { OrderDto, OrderItemDto, OrderStatus as ApiStatus } from "../domain/types.js";

// ── Unique order code generator ────────────────────────────────────

function makeOrderCode(): string {
  return `QR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

/** Retry up to 5 times to avoid code collision. */
async function uniqueOrderCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = makeOrderCode();
    if (!(await orderRepo.findByOrderCode(code))) return code;
  }
  return makeOrderCode();
}

// ── Service methods ───────────────────────────────────────────────

export async function listOrders(): Promise<OrderDto[]> {
  const rows = await orderRepo.findAll();
  return rows.map(serializeOrder);
}

export async function createOrder(
  tableCode: string,
  customerName: string | undefined,
  items: OrderItemDto[],
  placedBy?: string
): Promise<OrderDto> {
  const table = await tableRepo.findActiveByCode(tableCode);
  if (!table) throw new Error(`Unknown or inactive table: ${tableCode}`);

  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  const row = await orderRepo.createOrder({
    orderCode: await uniqueOrderCode(),
    tableId: table.id,
    customerName: customerName || "Guest",
    placedBy: placedBy || "CUSTOMER",
    totalAmount: total,
    items: items.map((i) => ({ itemName: i.name, qty: i.qty || 1, unitPrice: i.price || 0 }))
  });

  // Try to send invoice email if placedBy is a registered user
  if (placedBy && placedBy !== "CUSTOMER") {
    userRepo.findById(placedBy).then((user) => {
      if (user?.email) {
        sendInvoiceEmail(user.email, {
          orderCode: row.orderCode,
          total,
          items: items.map(i => ({ name: i.name, qty: i.qty || 1, price: i.price || 0 }))
        }).catch(err => console.error("Failed to send invoice email", err));
      }
    });
  }

  return serializeOrder(row);
}

export async function updateStatus(orderId: string, status: ApiStatus, changedBy: string): Promise<OrderDto> {
  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  const next = toUpperStatus(status) as OrderStatus;
  const updated = await orderRepo.updateStatus(orderId, next, changedBy);
  if (!updated) throw new Error("Order not found");

  return serializeOrder(updated);
}

export async function addItemsToOrder(orderId: string, items: OrderItemDto[]): Promise<OrderDto> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items are required");
  }

  const updated = await orderRepo.appendItems({
    orderId,
    items: items.map((i) => ({ itemName: i.name, qty: i.qty || 1, unitPrice: i.price || 0 }))
  });
  if (!updated) throw new Error("Order not found");
  return serializeOrder(updated);
}
