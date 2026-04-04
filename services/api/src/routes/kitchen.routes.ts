/**
 * Kitchen display endpoints.
 *
 * GET /kitchen/board — active orders grouped by status lane
 */

import { Router } from "express";
import * as kitchenService from "../services/kitchen.service.js";
import { requireAuth } from "../middleware/auth-guard.js";

export const kitchenRouter = Router();

// Protect the route so only authenticated users (waiters/admins) can view KDS
kitchenRouter.get("/board", requireAuth(), async (_req, res) => {
  const board = await kitchenService.getBoard();
  res.json(board);
});
