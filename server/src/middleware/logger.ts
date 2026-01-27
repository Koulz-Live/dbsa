import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      timestamp,
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
    }),
  );
  next();
};
