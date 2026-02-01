import { Request, Response, NextFunction } from "express";
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

    console.log("🔐 AUTH MIDDLEWARE - Using Supabase getUser");

    // Use Supabase to verify the token (it handles JWT verification internally)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log("❌ Auth error:", authError?.message);
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
      return;
    }

    console.log("✅ User authenticated:", user.id, user.email);

    // Fetch user role from user_roles table
    const { data: userRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    console.log("🔍 Auth Debug:", {
      userId: user.id,
      email: user.email,
      roleFromDb: userRoles?.role,
      roleError: roleError?.message,
      metadata: user.user_metadata,
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || "",
      role: userRoles?.role || user.user_metadata?.role,
    };

    console.log("✅ User attached to request:", req.user);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
};
