/**
 * Central route registry.
 * Keeps server.ts clean by mounting all routers in one place.
 */

import type { Express } from "express";
import { authRouter } from "./auth.routes.js";
import { customerAuthRouter } from "./customer-auth.routes.js";
import { menuRouter } from "./menu.routes.js";
import { ordersRouter } from "./order.routes.js";
import { kitchenRouter } from "./kitchen.routes.js";
import { paymentsRouter } from "./payment.routes.js";
import { tablesRouter } from "./tables.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/auth", authRouter);
  app.use("/auth/customer", customerAuthRouter);
  app.use("/menu", menuRouter);
  app.use("/orders", ordersRouter);
  app.use("/kitchen", kitchenRouter);
  app.use("/payments", paymentsRouter);
  app.use("/tables", tablesRouter);
}
