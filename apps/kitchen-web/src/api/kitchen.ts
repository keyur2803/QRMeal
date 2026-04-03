/**
 * Kitchen API client.
 * Fetches board data and updates order status.
 */

import { API_BASE } from "../config/env";
import type { KitchenBoard, KitchenStatus } from "../types/order";

export async function fetchBoard(): Promise<KitchenBoard> {
  const res = await fetch(`${API_BASE}/kitchen/board`);
  if (!res.ok) throw new Error("Failed to load board");
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: KitchenStatus) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, changedBy: "kitchen" })
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}
