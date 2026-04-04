/**
 * Kitchen API client with global toast-based error handling.
 */

import toast from "react-hot-toast";
import { API_BASE } from "../config/env";
import type { KitchenBoard, KitchenStatus } from "../types/order";

export async function fetchBoard(): Promise<KitchenBoard> {
  try {
    const res = await fetch(`${API_BASE}/kitchen/board`, { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to load board");
    }
    return res.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    toast.error(`KDS Error: ${msg}`);
    throw err;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: KitchenStatus | "served"
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, changedBy: "kitchen" }),
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update status");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Action failed";
    toast.error(`Order Update Failed: ${msg}`);
    throw err;
  }
}
