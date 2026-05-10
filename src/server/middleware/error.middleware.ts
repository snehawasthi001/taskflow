import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

interface AppError extends Error {
  status?: number;
  code?: string;
}

export function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  void _next;
  console.error("[Error]", err.message || err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "A record with this value already exists",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
  }

  // Custom errors with status
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({
    success: false,
    error: message,
  });
}
