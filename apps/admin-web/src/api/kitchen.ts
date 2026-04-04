/**
 * Kitchen Display API helpers.
 */

import { API_BASE } from "../config/env";

export type KitchenOrderItem = {
  name: string;
  qty: number;
  mod?: string;
};

export type KitchenOrder = {
  id: string;
  orderCode: string;
  table: string;
  status: "pending" | "preparing" | "ready";
  createdAt: string;
  items: KitchenOrderItem[];
  note?: string;
};

export type KitchenBoard = {
  pending: KitchenOrder[];
  preparing: KitchenOrder[];
  ready: KitchenOrder[];
};

export async function fetchKitchenBoard(): Promise<KitchenBoard> {
  const res = await fetch(`${API_BASE}/kitchen/board`);
  if (!res.ok) throw new Error("Failed to load kitchen board");
  return res.json();
}

export async function patchOrderStatus(
  orderId: string,
  status: "pending" | "preparing" | "ready" | "served"
): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, changedBy: "kitchen" }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
}
