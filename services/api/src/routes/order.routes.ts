/**
 * Order endpoints.
 *
 * GET   /orders          — list all orders
 * POST  /orders          — place a new order
 * POST  /orders/:id/items — add items to an active order
 * PATCH /orders/:id/status — update order status (kitchen drag-and-drop)
 */

import { Router } from "express";
import * as orderService from "../services/order.service.js";
import type { OrderItemDto, OrderStatus } from "../domain/types.js";

export const ordersRouter = Router();

ordersRouter.get("/", async (_req, res) => {
  const orders = await orderService.listOrders();
  res.json(orders);
});

ordersRouter.post("/", async (req, res) => {
  const { table, customerName, items } = req.body as {
    table?: string;
    customerName?: string;
    items?: OrderItemDto[];
  };

  if (!table || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "table and items are required" });
  }

  try {
    const order = await orderService.createOrder(table, customerName, items);
    return res.status(201).json(order);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create order";
    return res.status(400).json({ message: msg });
  }
});

ordersRouter.patch("/:id/status", async (req, res) => {
  const { status, changedBy } = req.body as { status?: OrderStatus; changedBy?: string };

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  try {
    const order = await orderService.updateStatus(req.params.id, status, changedBy || "kitchen");
    return res.json(order);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update status";
    const code = msg === "Order not found" ? 404 : msg === "Invalid status" ? 400 : 500;
    return res.status(code).json({ message: msg });
  }
});

ordersRouter.post("/:id/items", async (req, res) => {
  const { items } = req.body as { items?: OrderItemDto[] };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items are required" });
  }
  try {
    const order = await orderService.addItemsToOrder(req.params.id, items);
    return res.json(order);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not add items";
    const code = msg === "Order not found" ? 404 : msg === "Order is not active" ? 400 : 500;
    return res.status(code).json({ message: msg });
  }
});
