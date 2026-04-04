/**
 * Menu endpoints.
 *
 * GET  /menu            — list available items (public)
 * GET  /menu/admin      — list all items (owner JWT)
 * POST /menu            — create item JSON (owner JWT)
 * POST /menu/upload     — create item + optional image multipart (owner JWT)
 * POST /menu/:id/image  — replace image for item (owner JWT)
 * PATCH /menu/:id       — update item (owner JWT)
 */

import { Router } from "express";
import type { RequestHandler } from "express";
import * as menuService from "../services/menu.service.js";
import { requireAuth } from "../middleware/auth-guard.js";
import { uploadMenuImage, storeMenuItemImage, deleteMenuItemImage } from "../lib/menuImageUpload.js";

export const menuRouter = Router();

function routeParamId(raw: string | string[] | undefined): string {
  if (raw === undefined) return "";
  return Array.isArray(raw) ? raw[0] ?? "" : raw;
}

/** Multer error → 400 JSON */
const uploadSingle: RequestHandler = (req, res, next) => {
  uploadMenuImage.single("image")(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      return res.status(400).json({ message: msg });
    }
    next();
  });
};

menuRouter.get("/", async (_req, res) => {
  const items = await menuService.listAvailable();
  res.json(items);
});

menuRouter.get("/admin", requireAuth("owner"), async (_req, res) => {
  const items = await menuService.listAll();
  res.json(items);
});

/** Multipart create: fields category, name, price, description + optional file field image */
menuRouter.post("/upload", requireAuth("owner"), uploadSingle, async (req, res) => {
  const { category, name, price, description } = req.body as {
    category?: string;
    name?: string;
    price?: string;
    description?: string;
  };

  if (!name?.trim() || price === undefined || price === "") {
    return res.status(400).json({ message: "name and price are required" });
  }

  const p = Number(price);
  if (Number.isNaN(p)) {
    return res.status(400).json({ message: "invalid price" });
  }

  const file = req.file;
  const imageUrl = file ? await storeMenuItemImage(file) : null;

  const item = await menuService.addItem({
    category,
    name: name.trim(),
    price: p,
    description: description?.trim() || null,
    imageUrl
  });
  return res.status(201).json(item);
});

menuRouter.post("/", requireAuth("owner"), async (req, res) => {
  const { category, name, price, description } = req.body as {
    category?: string;
    name?: string;
    price?: number;
    description?: string | null;
  };

  if (!name || price === undefined || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "name and price are required" });
  }

  const item = await menuService.addItem({
    category,
    name,
    price: Number(price),
    description: description ?? null,
    imageUrl: null
  });
  return res.status(201).json(item);
});

menuRouter.post("/:id/image", requireAuth("owner"), uploadSingle, async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "image file is required" });
  }

  const id = routeParamId(req.params.id);
  const existing = await menuService.getById(id);
  if (!existing) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (existing.imageUrl) {
    await deleteMenuItemImage(existing.imageUrl);
  }

  const url = await storeMenuItemImage(file);
  const updated = await menuService.patchItem(id, { imageUrl: url });
  if (!updated) {
    return res.status(404).json({ message: "Item not found" });
  }
  return res.json(updated);
});

menuRouter.patch("/:id", requireAuth("owner"), async (req, res) => {
  const { name, price, description, isAvailable, category } = req.body as {
    name?: string;
    price?: number;
    description?: string | null;
    isAvailable?: boolean;
    category?: string;
  };

  const updated = await menuService.patchItem(routeParamId(req.params.id), {
    name,
    price: price !== undefined ? Number(price) : undefined,
    description,
    isAvailable,
    category
  });

  if (!updated) {
    return res.status(404).json({ message: "Item not found" });
  }

  return res.json(updated);
});
