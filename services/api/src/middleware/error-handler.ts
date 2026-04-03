/**
 * Global Express error handler.
 * Catches unhandled errors thrown in async route handlers
 * and returns a consistent JSON shape.
 */

import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  const message = err.message || "Internal server error";

  if (status === 500) {
    console.error("[unhandled]", err);
  }

  res.status(status).json({ message });
};
