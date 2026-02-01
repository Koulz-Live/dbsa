import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { logger } from "./middleware/logger";
import { authMiddleware } from "./middleware/auth";
import {
  apiLimiter,
  contentLimiter,
  uploadLimiter,
  exportLimiter,
} from "./middleware/rateLimiter";
import { csrfProtection, getCsrfToken } from "./middleware/csrf";

// Import routes
import contentRoutes from "./routes/content";
import workflowRoutes from "./routes/workflow";
import versionsRoutes from "./routes/versions";
import mediaRoutes from "./routes/media";
import auditRoutes from "./routes/audit";
import adminRoutes from "./routes/admin";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Cookie parser (required for CSRF)
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom middleware
app.use(requestId);
app.use(logger);

// Rate limiting - apply to all routes
app.use(apiLimiter);

// Health check (no auth required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CSRF token endpoint (no auth required, but rate limited)
app.get("/api/csrf-token", getCsrfToken);

// Protected routes (require authentication + CSRF protection)
app.use(
  "/api/content",
  authMiddleware,
  csrfProtection,
  contentLimiter,
  contentRoutes,
);
app.use("/api/workflow", authMiddleware, csrfProtection, workflowRoutes);
app.use("/api/versions", authMiddleware, csrfProtection, versionsRoutes);
app.use(
  "/api/media",
  authMiddleware,
  csrfProtection,
  uploadLimiter,
  mediaRoutes,
);
app.use("/api/audit", authMiddleware, auditRoutes); // Read-only, no CSRF needed
app.use("/api/audit/export", authMiddleware, csrfProtection, exportLimiter); // Export needs CSRF
app.use("/api/admin", authMiddleware, csrfProtection, adminRoutes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
