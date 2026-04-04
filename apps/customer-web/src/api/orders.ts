/**
 * Order placement and management API client.
 * Uses standardized `apiClient` for toast-based error notifications.
 */

import { apiClient } from "../lib/api-client";

export type OrderLine = { name: string; price: number; qty: number };

export type PlacedOrder = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  status: string;
  total: number;
};

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

export async function placeOrder(table: string, customerName: string, items: OrderLine[]): Promise<PlacedOrder> {
  return apiClient<PlacedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ table, customerName, items })
  });
}

export async function fetchOrders(): Promise<OrderDto[]> {
  return apiClient<OrderDto[]>("/orders");
}

export async function addItemsToOrder(orderId: string, items: OrderLine[]): Promise<OrderDto> {
  return apiClient<OrderDto>(`/orders/${orderId}/items`, {
    method: "POST",
    body: JSON.stringify({ items })
  });
}
