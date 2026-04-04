/**
 * Menu management API client.
 */

import { apiClient } from "../lib/api-client";
import type { MenuItem } from "../types/menu";

export async function fetchAdminMenu(): Promise<MenuItem[]> {
  return apiClient<MenuItem[]>("/menu/admin");
}

export async function addMenuItem(input: {
  category: string;
  name: string;
  price: number;
  description?: string;
  prepTime: string;
  calories?: string | null;
  dietaryTags?: string[];
  customizations?: string[];
}): Promise<MenuItem> {
  return apiClient<MenuItem>("/menu", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

/** Create item with optional image (multipart). */
export async function addMenuItemWithUpload(input: {
  category: string;
  name: string;
  price: number;
  description?: string;
  imageFile?: File | null;
  prepTime: string;
  calories?: string | null;
  dietaryTags?: string[];
  customizations?: string[];
}): Promise<MenuItem> {
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

  return apiClient<MenuItem>("/menu/upload", {
    method: "POST",
    body: fd,
    // Content-Type must be omitted to let the browser set the boundary
    headers: {} 
  });
}

/** Replace image for an existing item. */
export async function uploadMenuItemImage(itemId: string, file: File): Promise<MenuItem> {
  const fd = new FormData();
  fd.append("image", file);
  return apiClient<MenuItem>(`/menu/${itemId}/image`, {
    method: "POST",
    body: fd,
    headers: {}
  });
}

export async function patchMenuItem(
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
  return apiClient<MenuItem>(`/menu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  return apiClient<void>(`/menu/${id}`, {
    method: "DELETE"
  });
}
