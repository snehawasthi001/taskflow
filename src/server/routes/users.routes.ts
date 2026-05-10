import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { updateProfileSchema } from "../../lib/validations/user.schema";

const router = Router();
router.use(authMiddleware);

router.get("/me", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! }, select: { id: true, name: true, email: true, image: true, bio: true, timezone: true, createdAt: true } });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.patch("/me", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.userId! }, data, select: { id: true, name: true, email: true, image: true, bio: true, timezone: true } });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.get("/", async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, image: true } });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
});

export { router as userRoutes };
