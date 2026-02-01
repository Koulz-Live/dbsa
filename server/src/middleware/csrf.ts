import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * Uses the Double Submit Cookie pattern with SameSite cookies
 */

// Extend Express Request type to include CSRF token
declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-csrf-token";

// Generate a CSRF token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Set CSRF token in cookie and request
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Generate and set token for GET requests (so client can use it)
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 3600000, // 1 hour
    });
    req.csrfToken = token;
    return next();
  }

  // For state-changing methods (POST, PUT, PATCH, DELETE), verify CSRF token
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
  const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];

  // Check if both tokens exist
  if (!tokenFromHeader || !tokenFromCookie) {
    return res.status(403).json({
      error: {
        code: "CSRF_TOKEN_MISSING",
        message:
          "CSRF token is missing. Please refresh the page and try again.",
      },
    });
  }

  // Verify tokens match
  if (tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      error: {
        code: "CSRF_TOKEN_INVALID",
        message:
          "CSRF token is invalid. Please refresh the page and try again.",
      },
    });
  }

  // Token is valid, proceed
  req.csrfToken = tokenFromCookie;
  next();
};

// Middleware to generate and attach CSRF token to response
export const attachCsrfToken = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // JavaScript needs to read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
  });
  // Also send in response for convenience
  res.locals.csrfToken = token;
  next();
};

// Optional: Endpoint to get CSRF token explicitly
export const getCsrfToken = (_req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });
  res.json({ csrfToken: token });
};
