/**
 * Public menu API (available items only).
 */

import { API_BASE } from "../config/env";
import type { MenuItem } from "../types/menu";

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error("Could not load menu");
  return res.json();
}
