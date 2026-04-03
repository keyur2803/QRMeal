/**
 * Application entry point.
 * Wires up Express middleware, routes, and starts listening.
 * No business logic lives here — only bootstrap glue.
 */

import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import type { Server } from "node:http";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { ensureMenuUploadsDir } from "./lib/menuImageUpload.js";

const app = express();

try {
  ensureMenuUploadsDir();
} catch (e) {
  console.error("Uploads directory is not writable. Upload endpoints may fail.");
  console.error(e);
}
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
  const maxAttempts = 10;
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await prisma.$connect();
      console.log("PostgreSQL connected");
      break;
    } catch (e) {
      const lastAttempt = attempt === maxAttempts;
      console.error(`PostgreSQL connection failed (attempt ${attempt}/${maxAttempts})`);
      console.error(e);
      if (lastAttempt) {
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const server: Server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`QRMEAL API running → http://0.0.0.0:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main();
