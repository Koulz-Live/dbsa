import { Request, Response, NextFunction } from "express";

// RBAC middleware factory
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
        details: { requiredRoles: allowedRoles },
      });
      return;
    }

    next();
  };
};
