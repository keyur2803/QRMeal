/**
 * Menu business logic.
 */

import * as menuRepo from "../repositories/menu.repository.js";
import type { MenuItemDto } from "../domain/types.js";

function toDto(i: {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: unknown;
  prepTime: string;
  calories: string | null;
  dietaryTags: string[];
  customizations: string[];
  isAvailable: boolean;
  category: { name: string };
}): MenuItemDto {
  return {
    id: i.id,
    category: i.category.name,
    name: i.name,
    description: i.description,
    imageUrl: i.imageUrl,
    price: Number(i.price),
    prepTime: i.prepTime,
    calories: i.calories,
    dietaryTags: i.dietaryTags,
    customizations: i.customizations,
    isAvailable: i.isAvailable
  };
}

export async function listAvailable(): Promise<MenuItemDto[]> {
  const items = await menuRepo.findAvailableItems();
  return items.map(toDto);
}

export async function listAll(): Promise<MenuItemDto[]> {
  const items = await menuRepo.findAllItems();
  return items.map(toDto);
}

export async function getById(id: string): Promise<MenuItemDto | null> {
  const row = await menuRepo.findById(id);
  return row ? toDto(row) : null;
}

export async function addItem(input: {
  category: string | undefined;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  prepTime: string;
  calories?: string | null;
  dietaryTags?: string[];
  customizations?: string[];
}): Promise<MenuItemDto> {
  const cat = await menuRepo.upsertCategory(input.category?.trim() || "General");
  const item = await menuRepo.createItem(
    cat.id,
    input.name,
    input.price,
    input.description,
    input.imageUrl,
    input.prepTime,
    input.calories,
    input.dietaryTags,
    input.customizations
  );
  return toDto(item);
}

export async function patchItem(
  id: string,
  patch: {
    name?: string;
    price?: number;
    description?: string | null;
    imageUrl?: string | null;
    isAvailable?: boolean;
    category?: string;
    prepTime?: string;
    calories?: string | null;
    dietaryTags?: string[];
    customizations?: string[];
  }
): Promise<MenuItemDto | null> {
  let categoryId: string | undefined;
  if (patch.category !== undefined) {
    const cat = await menuRepo.upsertCategory(patch.category.trim() || "General");
    categoryId = cat.id;
  }
  const row = await menuRepo.updateItem(id, {
    name: patch.name,
    price: patch.price,
    description: patch.description,
    imageUrl: patch.imageUrl,
    isAvailable: patch.isAvailable,
    categoryId,
    prepTime: patch.prepTime,
    calories: patch.calories,
    dietaryTags: patch.dietaryTags,
    customizations: patch.customizations
  });
  return row ? toDto(row) : null;
}
