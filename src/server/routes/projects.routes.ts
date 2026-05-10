import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { createProjectSchema, updateProjectSchema, projectFilterSchema } from "../../lib/validations/project.schema";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder, search, teamId, isArchived } = projectFilterSchema.parse(req.query);
    const where = {
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      ...(teamId && { teamId }),
      ...(isArchived !== undefined && { isArchived }),
    };
    const [projects, total] = await Promise.all([
      prisma.project.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sortBy]: sortOrder }, include: { team: true, _count: { select: { tasks: true } } } }),
      prisma.project.count({ where }),
    ]);
    res.json({ success: true, data: projects, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUniqueOrThrow({ where: { id: req.params.id }, include: { team: true, tasks: { include: { assignee: { select: { id: true, name: true, image: true } } }, orderBy: { position: "asc" } } } });
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({ data, include: { team: true } });
    res.status(201).json({ success: true, data: project });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const project = await prisma.project.update({ where: { id: req.params.id }, data, include: { team: true } });
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Project deleted" });
  } catch (error) { next(error); }
});

export { router as projectRoutes };
