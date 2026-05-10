// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Express API Server
//  Port 3001 · Helmet · CORS · Morgan · Rate Limit · Socket.io
// ═══════════════════════════════════════════════════════════════

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { initializeSocket } from "./websocket/socket";
import { taskRoutes } from "./routes/tasks.routes";
import { projectRoutes } from "./routes/projects.routes";
import { teamRoutes } from "./routes/teams.routes";
import { userRoutes } from "./routes/users.routes";
import { commentRoutes } from "./routes/comments.routes";
import { notificationRoutes } from "./routes/notifications.routes";
import { searchRoutes } from "./routes/search.routes";
import { auditRoutes } from "./routes/audit.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { metricsHandler, metricsMiddleware } from "./middleware/metrics.middleware";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────
app.use(morgan("short"));

// ── Rate Limiting ─────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
}));

// ── Metrics ───────────────────────────────────────────────────
app.use(metricsMiddleware);
app.get("/metrics", metricsHandler);

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/audit", auditRoutes);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorMiddleware);

// ── Socket.io ─────────────────────────────────────────────────
initializeSocket(httpServer);

// ── Graceful Shutdown ─────────────────────────────────────────
const shutdown = () => {
  console.log("[Server] SIGTERM received. Shutting down gracefully...");
  httpServer.close(() => {
    console.log("[Server] HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[Server] Forced shutdown after 10s timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ── Start ─────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[Server] TaskFlow API running on http://localhost:${PORT}`);
  console.log(`[Server] Health: http://localhost:${PORT}/api/health`);
});

export default app;
