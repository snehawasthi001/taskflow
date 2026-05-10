import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") return res.json({ success: true, data: { tasks: [], projects: [], users: [] } });

    const [tasks, projects, users] = await Promise.all([
      prisma.task.findMany({ where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: 10, select: { id: true, title: true, status: true, priority: true, projectId: true } }),
      prisma.project.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, name: true, color: true } }),
      prisma.user.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }, take: 5, select: { id: true, name: true, email: true, image: true } }),
    ]);

    res.json({ success: true, data: { tasks, projects, users } });
  } catch (error) { next(error); }
});

export { router as searchRoutes };
