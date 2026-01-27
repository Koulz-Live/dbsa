import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { config } from "../config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT with Supabase secret
    const decoded = verify(token, config.supabase.jwtSecret) as {
      sub: string;
      email: string;
    };

    // Get user data from Supabase (optional: fetch role from custom claims or user_roles table)
    const { data: user, error } = await supabase.auth.admin.getUserById(
      decoded.sub,
    );

    if (error || !user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Invalid token or user not found",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.user.id,
      email: user.user.email || "",
      // role can be fetched from user_metadata or a separate user_roles table
      role: user.user.user_metadata?.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
};
