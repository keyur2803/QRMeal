/**
 * Menu data access.
 * Handles MenuCategory + MenuItem queries.
 */

import { prisma } from "../db/prisma.js";

export function findAvailableItems() {
  return prisma.menuItem.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }]
  });
}

export function findAllItems() {
  return prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }]
  });
}

/** Get or create a category by name. */
export async function upsertCategory(name: string) {
  const existing = await prisma.menuCategory.findFirst({ where: { name } });
  if (existing) return existing;

  const max = await prisma.menuCategory.aggregate({ _max: { sortOrder: true } });
  return prisma.menuCategory.create({
    data: { name, sortOrder: (max._max.sortOrder ?? -1) + 1 }
  });
}

export function createItem(
  categoryId: string,
  name: string,
  price: number,
  description?: string | null,
  imageUrl?: string | null,
  prepTime?: string,
  calories?: string | null,
  dietaryTags?: string[],
  customizations?: string[]
) {
  return prisma.menuItem.create({
    data: {
      categoryId,
      name,
      price,
      prepTime: prepTime ?? "",
      calories: calories ?? null,
      dietaryTags: dietaryTags ?? [],
      customizations: customizations ?? [],
      description: description?.trim() || null,
      imageUrl: imageUrl ?? null
    },
    include: { category: true }
  });
}

export function findById(id: string) {
  return prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
}

export function deleteById(id: string) {
  return prisma.menuItem.delete({ where: { id }, include: { category: true } });
}

export async function updateItem(
  id: string,
  data: {
    name?: string;
    price?: number;
    description?: string | null;
    imageUrl?: string | null;
    isAvailable?: boolean;
    categoryId?: string;
    prepTime?: string;
    calories?: string | null;
    dietaryTags?: string[];
    customizations?: string[];
  }
) {
  const payload: {
    name?: string;
    price?: number;
    description?: string | null;
    imageUrl?: string | null;
    isAvailable?: boolean;
    categoryId?: string;
    prepTime?: string;
    calories?: string | null;
    dietaryTags?: string[];
    customizations?: string[];
  } = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.price !== undefined) payload.price = data.price;
  if (data.description !== undefined) payload.description = data.description;
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
  if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable;
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
  if (data.prepTime !== undefined) payload.prepTime = data.prepTime;
  if (data.calories !== undefined) payload.calories = data.calories;
  if (data.dietaryTags !== undefined) payload.dietaryTags = data.dietaryTags;
  if (data.customizations !== undefined) payload.customizations = data.customizations;

  try {
    if (Object.keys(payload).length === 0) {
      return await prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
    }
    return await prisma.menuItem.update({
      where: { id },
      data: payload,
      include: { category: true }
    });
  } catch {
    return null;
  }
}
