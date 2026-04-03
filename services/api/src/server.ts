/**
 * Application entry point.
 * Wires up Express middleware, routes, and starts listening.
 * No business logic lives here — only bootstrap glue.
 */

import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { ensureMenuUploadsDir } from "./lib/menuImageUpload.js";

const app = express();

ensureMenuUploadsDir();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Global middleware ──────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Health check (quick DB ping) ──────────────────────────────────

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "qrmeal-api", database: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", service: "qrmeal-api", database: "disconnected" });
  }
});

// ── API routes ─────────────────────────────────────────────────────

registerRoutes(app);

// ── Error handler (must be registered after routes) ────────────────

app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────

async function main() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");
  } catch (e) {
    console.error("PostgreSQL connection failed — check DATABASE_URL in .env");
    console.error(e);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`QRMEAL API running → http://localhost:${env.port}`);
  });
}

main();
