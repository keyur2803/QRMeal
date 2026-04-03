/**
 * Table data access.
 */

import { prisma } from "../db/prisma.js";

export function findActiveByCode(code: string) {
  return prisma.table.findFirst({ where: { code, isActive: true } });
}
