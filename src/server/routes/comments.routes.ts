import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { createCommentSchema } from "../../lib/validations/user.schema";

const router = Router();
router.use(authMiddleware);

router.get("/task/:taskId", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.comment.findMany({ where: { taskId: req.params.taskId }, include: { author: { select: { id: true, name: true, image: true } }, replies: { include: { author: { select: { id: true, name: true, image: true } } } } }, orderBy: { createdAt: "asc" } });
    res.json({ success: true, data: comments });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createCommentSchema.parse(req.body);
    const comment = await prisma.comment.create({ data: { ...data, authorId: req.userId! }, include: { author: { select: { id: true, name: true, image: true } } } });
    res.status(201).json({ success: true, data: comment });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Comment deleted" });
  } catch (error) { next(error); }
});

export { router as commentRoutes };
