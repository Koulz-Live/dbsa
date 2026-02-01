import { Request, Response, NextFunction } from "express";

// RBAC middleware factory
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    console.log("🔐 RBAC Check:", {
      path: req.path,
      userRole,
      requiredRoles: allowedRoles,
      hasAccess: userRole && allowedRoles.includes(userRole),
    });

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log("❌ Access denied - insufficient permissions");
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
        details: { requiredRoles: allowedRoles },
      });
      return;
    }

    console.log("✅ Access granted");
    next();
  };
};
