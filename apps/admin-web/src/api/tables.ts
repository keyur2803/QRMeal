/**
 * Admin API client for table management.
 */

import { API_BASE } from "../config/env";

export type TableRow = {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
};

export async function fetchTables(): Promise<TableRow[]> {
  const res = await fetch(`${API_BASE}/tables`);
  if (!res.ok) throw new Error("Failed to load tables");
  return res.json();
}

export async function createTable(label: string): Promise<TableRow> {
  const res = await fetch(`${API_BASE}/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to create table" }));
    throw new Error(err.message ?? "Failed to create table");
  }
  return res.json();
}

export async function deleteTable(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/tables/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to delete table" }));
    throw new Error(err.message ?? "Failed to delete table");
  }
  return res.json();
}

export async function updateTable(
  id: string,
  data: { label?: string; isActive?: boolean }
): Promise<TableRow> {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update table");
  return res.json();
}
