/**
 * Kitchen display endpoints.
 *
 * GET /kitchen/board — active orders grouped by status lane
 */

import { Router } from "express";
import * as kitchenService from "../services/kitchen.service.js";

export const kitchenRouter = Router();

kitchenRouter.get("/board", async (_req, res) => {
  const board = await kitchenService.getBoard();
  res.json(board);
});
