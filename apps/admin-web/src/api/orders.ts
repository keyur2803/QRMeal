/**
 * Dashboard / Order Stats API client.
 */

import { apiClient } from "../lib/api-client";
import type { OrderSummary } from "../types/order";

export type OrderStats = {
  todayRevenue: number;
  activeOrders: number;
  averageCheck: number;
  totalOrders: number;
  revenueChange: number;
  ordersChange: number;
};

export type RecentOrder = {
  id: string;
  orderCode: string;
  table: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; qty: number }[];
};

export async function fetchOrders(): Promise<OrderSummary[]> {
  return apiClient<OrderSummary[]>("/orders");
}

export async function fetchOrderStats(): Promise<OrderStats> {
  return apiClient<OrderStats>("/orders/stats/summary");
}

export async function fetchRecentOrders(): Promise<RecentOrder[]> {
  return apiClient<RecentOrder[]>("/orders");
}

export type CreateOrderPayload = {
  table: string;
  customerName?: string;
  placedBy?: string;
  items: { name: string; qty: number; price: number }[];
};

export async function createOrder(payload: CreateOrderPayload) {
  return apiClient("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(orderId: string, status: string, changedBy?: string) {
  return apiClient(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, changedBy }),
  });
}
