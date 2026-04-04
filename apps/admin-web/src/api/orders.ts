/**
 * Order API client for admin dashboard.
 */

import { API_BASE } from "../config/env";
import type { OrderSummary } from "../types/order";

export async function fetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function patchOrderStatus(
  orderId: string,
  status: string
): Promise<OrderSummary> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, changedBy: "kitchen" }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}
