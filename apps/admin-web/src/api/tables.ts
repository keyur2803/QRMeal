/**
 * Admin API client for table management.
 */

import { apiClient } from "../lib/api-client";

export type TableRow = {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
};

export async function fetchTables(): Promise<TableRow[]> {
  return apiClient<TableRow[]>("/tables");
}

export async function createTable(label: string): Promise<TableRow> {
  return apiClient<TableRow>("/tables", {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

export async function deleteTable(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/tables/${id}`, { 
    method: "DELETE" 
  });
}

export async function updateTable(
  id: string,
  data: { label?: string; isActive?: boolean }
): Promise<TableRow> {
  return apiClient<TableRow>(`/tables/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
