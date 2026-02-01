import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests from this IP, please try again later.",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req: Request) => req.path === "/health",
  // Custom handler for rate limit exceeded
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
      },
    });
  },
});

// Stricter rate limiter for authentication endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: {
      code: "TOO_MANY_AUTH_ATTEMPTS",
      message:
        "Too many authentication attempts from this IP, please try again after 15 minutes.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_AUTH_ATTEMPTS",
        message:
          "Too many authentication attempts. Please try again after 15 minutes.",
        retryAfter: "15 minutes",
      },
    });
  },
});

// Moderate rate limiter for content creation/updates - 30 per 15 minutes
export const contentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 content modifications per windowMs
  message: {
    error: {
      code: "TOO_MANY_MODIFICATIONS",
      message: "Too many content modifications, please slow down.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_MODIFICATIONS",
        message:
          "Too many content modifications. Please try again in a few minutes.",
        retryAfter: "15 minutes",
      },
    });
  },
});

// Strict rate limiter for media uploads - 10 per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: {
      code: "TOO_MANY_UPLOADS",
      message: "Too many upload requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_UPLOADS",
        message: "Upload limit exceeded. Please try again in an hour.",
        retryAfter: "1 hour",
      },
    });
  },
});

// Export endpoint - stricter limit for resource-intensive operations
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 exports per 15 minutes
  message: {
    error: {
      code: "TOO_MANY_EXPORTS",
      message: "Too many export requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_EXPORTS",
        message: "Export limit exceeded. Please try again in 15 minutes.",
        retryAfter: "15 minutes",
      },
    });
  },
});
