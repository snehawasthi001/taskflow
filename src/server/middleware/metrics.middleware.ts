import { Request, Response, NextFunction } from "express";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Metrics] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
}
