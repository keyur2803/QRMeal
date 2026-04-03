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
