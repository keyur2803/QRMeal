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

export type OrderHistoryEntry = { from: string | null; to: string; at: string };
export type OrderDto = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  items: OrderLine[];
  status: string;
  total: number;
  history: OrderHistoryEntry[];
  createdAt: string;
};

export async function fetchOrders(): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Could not load orders");
  return res.json();
}

export async function addItemsToOrder(orderId: string, items: OrderLine[]): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Could not add items");
  return data as OrderDto;
}
