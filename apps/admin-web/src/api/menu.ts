/**
 * Menu management API (owner JWT required).
 */

import { API_BASE } from "../config/env";
import type { MenuItem } from "../types/menu";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchAdminMenu(token: string): Promise<MenuItem[]> {
  const res = await fetch(`${API_BASE}/menu/admin`, { headers: authHeaders(token) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to load menu");
  return data as MenuItem[];
}

export async function addMenuItem(
  token: string,
  input: {
    category: string;
    name: string;
    price: number;
    description?: string;
    prepTime: string;
    calories?: string | null;
    dietaryTags?: string[];
    customizations?: string[];
  }
): Promise<MenuItem> {
  const res = await fetch(`${API_BASE}/menu`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      category: input.category,
      name: input.name,
      price: input.price,
      description: input.description || null,
      prepTime: input.prepTime,
      calories: input.calories || null,
      dietaryTags: input.dietaryTags || [],
      customizations: input.customizations || []
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to add item");
  return data as MenuItem;
}

/** Create item with optional image (multipart). */
export async function addMenuItemWithUpload(
  token: string,
  input: {
    category: string;
    name: string;
    price: number;
    description?: string;
    imageFile?: File | null;
    prepTime: string;
    calories?: string | null;
    dietaryTags?: string[];
    customizations?: string[];
  }
): Promise<MenuItem> {
  const fd = new FormData();
  fd.append("category", input.category);
  fd.append("name", input.name);
  fd.append("price", String(input.price));
  if (input.description) fd.append("description", input.description);
  
  fd.append("prepTime", input.prepTime);
  if (input.calories) fd.append("calories", input.calories);
  if (input.dietaryTags) fd.append("dietaryTags", JSON.stringify(input.dietaryTags));
  if (input.customizations) fd.append("customizations", JSON.stringify(input.customizations));
  
  if (input.imageFile) fd.append("image", input.imageFile);

  const res = await fetch(`${API_BASE}/menu/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to add item");
  return data as MenuItem;
}

/** Replace image for an existing item. */
export async function uploadMenuItemImage(token: string, itemId: string, file: File): Promise<MenuItem> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API_BASE}/menu/${itemId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Upload failed");
  return data as MenuItem;
}

export async function patchMenuItem(
  token: string,
  id: string,
  patch: Partial<{
    name: string;
    price: number;
    description: string | null;
    isAvailable: boolean;
    category: string;
    prepTime: string;
    calories: string | null;
    dietaryTags: string[];
    customizations: string[];
  }>
): Promise<MenuItem> {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to update");
  return data as MenuItem;
}

export async function deleteMenuItem(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to delete");
}
