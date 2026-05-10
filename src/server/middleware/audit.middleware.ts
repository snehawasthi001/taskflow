import { Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { AuthRequest } from "./auth.middleware";

export function auditMiddleware(entityType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: Record<string, unknown>) {
      // Log audit entry for mutations
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && res.statusCode < 400) {
        const action = req.method === "POST" ? "CREATE" : req.method === "DELETE" ? "DELETE" : "UPDATE";
        prisma.auditLog.create({
          data: {
            action: action as "CREATE" | "UPDATE" | "DELETE",
            entityType,
            entityId: (body?.data as Record<string, string>)?.id || req.params.id || "unknown",
            details: { method: req.method, path: req.path },
            userId: req.userId || "system",
            ipAddress: req.ip || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          },
        }).catch((err: Error) => console.error("[Audit] Error:", err.message));
      }

      return originalJson(body);
    } as typeof res.json;

    next();
  };
}
