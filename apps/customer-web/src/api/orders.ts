/**
 * Order placement API.
 */

import { API_BASE } from "../config/env";

export type OrderLine = { name: string; price: number; qty: number };

export type PlacedOrder = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  status: string;
  total: number;
};

export async function placeOrder(table: string, customerName: string, items: OrderLine[]): Promise<PlacedOrder> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, customerName, items })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Could not place order");
  return data as PlacedOrder;
}
