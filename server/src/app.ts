import express from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { logger } from "./middleware/logger";
import { authMiddleware } from "./middleware/auth";

// Import routes
import contentRoutes from "./routes/content";
import workflowRoutes from "./routes/workflow";
import versionsRoutes from "./routes/versions";
import mediaRoutes from "./routes/media";
import auditRoutes from "./routes/audit";
import adminRoutes from "./routes/admin";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom middleware
app.use(requestId);
app.use(logger);

// Health check (no auth required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
app.use("/api/content", authMiddleware, contentRoutes);
app.use("/api/workflow", authMiddleware, workflowRoutes);
app.use("/api/versions", authMiddleware, versionsRoutes);
app.use("/api/media", authMiddleware, mediaRoutes);
app.use("/api/audit", authMiddleware, auditRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
