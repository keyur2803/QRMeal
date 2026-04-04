/**
 * Table management API routes.
 *
 * GET    /tables           — list all tables
 * POST   /tables           — create a new table
 * PATCH  /tables/:id       — update label / isActive
 * DELETE /tables/:id       — delete table (soft-delete if has orders, hard-delete if empty)
 */

import { Router } from "express";
import * as tableRepo from "../repositories/table.repository.js";

export const tablesRouter = Router();

/** GET /tables — list all tables with order count */
tablesRouter.get("/", async (_req, res) => {
  const tables = await tableRepo.findAll();
  res.json(
    tables.map((t) => ({
      id: t.id,
      code: t.code,
      label: t.label,
      isActive: t.isActive,
      orderCount: (t as { _count: { orders: number } })._count.orders,
      createdAt: t.createdAt,
    }))
  );
});

/** POST /tables — create table */
tablesRouter.post("/", async (req, res) => {
  const { label } = req.body as { label?: string };
  if (!label?.trim()) {
    return res.status(400).json({ message: "label is required" });
  }

  // Auto-generate code: T-1, T-2, ... (next unused integer)
  const all = await tableRepo.findAll();
  const num = all.length + 1;
  const code = `T-${num}`;

  try {
    const table = await tableRepo.create({ code, label: label.trim() });
    return res.status(201).json({
      id: table.id,
      code: table.code,
      label: table.label,
      isActive: table.isActive,
      orderCount: 0,
      createdAt: table.createdAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create table";
    return res.status(400).json({ message: msg });
  }
});

/** PATCH /tables/:id — update label or isActive */
tablesRouter.patch("/:id", async (req, res) => {
  const { label, isActive } = req.body as { label?: string; isActive?: boolean };
  try {
    const updated = await tableRepo.update(req.params.id, {
      ...(label !== undefined && { label }),
      ...(isActive !== undefined && { isActive }),
    });
    return res.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update table";
    return res.status(400).json({ message: msg });
  }
});

/** DELETE /tables/:id — soft-delete if has orders, hard-delete if empty */
tablesRouter.delete("/:id", async (req, res) => {
  try {
    const table = await tableRepo.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // Check order count using a Prisma query
    const { prisma } = await import("../db/prisma.js");
    const orderCount = await prisma.order.count({ where: { tableId: req.params.id } });

    if (orderCount > 0) {
      // Soft-delete — keep data, mark inactive
      await tableRepo.softDelete(req.params.id);
      return res.json({ message: "Table deactivated (has orders)" });
    } else {
      // Hard-delete — no orders, safe to remove
      await tableRepo.hardDelete(req.params.id);
      return res.json({ message: "Table deleted" });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not delete table";
    return res.status(500).json({ message: msg });
  }
});
