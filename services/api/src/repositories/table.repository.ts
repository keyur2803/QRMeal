/**
 * Table repository — CRUD for restaurant tables.
 */

import { prisma } from "../db/prisma.js";

export function findAll() {
  return prisma.table.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { orders: true } },
    },
  });
}

export function findActiveByCode(code: string) {
  return prisma.table.findFirst({ where: { code, isActive: true } });
}

export function findById(id: string) {
  return prisma.table.findUnique({ where: { id } });
}

export function create(data: { code: string; label: string }) {
  return prisma.table.create({ data });
}

export function update(id: string, data: { label?: string; isActive?: boolean }) {
  return prisma.table.update({ where: { id }, data });
}

export function softDelete(id: string) {
  return prisma.table.update({ where: { id }, data: { isActive: false } });
}

export function hardDelete(id: string) {
  return prisma.table.delete({ where: { id } });
}
