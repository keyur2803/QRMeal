/**
 * Database seed script.
 * Run via:  npm run db:seed --workspace services/api
 *
 * Idempotent — safe to re-run without duplicating data.
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────

async function ensureCategory(name: string, sortOrder: number) {
  const existing = await prisma.menuCategory.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.menuCategory.create({ data: { name, sortOrder } });
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  // Tables
  const tables = [
    { code: "T-12", label: "Table 12" },
    { code: "T-05", label: "Table 5" },
    { code: "T-DEMO", label: "Demo table" }
  ];
  for (const t of tables) {
    await prisma.table.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  // Staff users (password visible only in dev seed)
  const ownerHash = await bcrypt.hash("owner123", 10);
  const chefHash = await bcrypt.hash("chef123", 10);

  await prisma.user.upsert({
    where: { email: "owner@qrmeal.dev" },
    update: {},
    create: { name: "Owner", email: "owner@qrmeal.dev", passwordHash: ownerHash, role: UserRole.OWNER }
  });

  await prisma.user.upsert({
    where: { email: "kitchen@qrmeal.dev" },
    update: {},
    create: { name: "Chef", email: "kitchen@qrmeal.dev", passwordHash: chefHash, role: UserRole.KITCHEN }
  });

  // Menu categories & items
  const starters = await ensureCategory("Starters", 0);
  const mains = await ensureCategory("Main", 1);
  const drinks = await ensureCategory("Drinks", 2);

  const items = [
    { categoryId: starters.id, name: "Garlic Bread", price: 120 },
    { categoryId: mains.id, name: "Margherita Pizza", price: 320 },
    { categoryId: drinks.id, name: "Fresh Lemonade", price: 90 }
  ];

  for (const item of items) {
    const exists = await prisma.menuItem.findFirst({
      where: { categoryId: item.categoryId, name: item.name }
    });
    if (!exists) {
      await prisma.menuItem.create({ data: item });
    }
  }

  console.log("Seed complete");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
