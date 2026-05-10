import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId, page = "1", limit = "20" } = req.query;
    const where = {
      ...(entityType && { entityType: entityType as string }),
      ...(entityId && { entityId: entityId as string }),
    };
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * l, take: l, include: { user: { select: { id: true, name: true, image: true } } } }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ success: true, data: logs, meta: { page: p, limit: l, total } });
  } catch (error) { next(error); }
});

export { router as auditRoutes };
