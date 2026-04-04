/**
 * Public menu API client with global error handling.
 */

import { apiClient } from "../lib/api-client";
import type { MenuItem } from "../types/menu";

export async function fetchMenu(): Promise<MenuItem[]> {
  return apiClient<MenuItem[]>("/menu");
}
