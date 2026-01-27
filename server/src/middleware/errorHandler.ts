import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export const errorHandler = (
  err: Error | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const errorResponse: ErrorResponse = {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    requestId: req.id,
  };

  // Zod validation errors
  if (err instanceof ZodError) {
    errorResponse.code = "VALIDATION_ERROR";
    errorResponse.message = "Invalid input";
    errorResponse.details = err.errors;
    res.status(400).json(errorResponse);
    return;
  }

  // Custom error types (can be extended)
  if ("code" in err && typeof err.code === "string") {
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    res.status(400).json(errorResponse);
    return;
  }

  // Generic errors
  console.error("Unhandled error:", err);
  res.status(500).json(errorResponse);
};
