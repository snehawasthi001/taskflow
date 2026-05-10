import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: "desc" }, take: 50 });
    const unreadCount = await prisma.notification.count({ where: { userId: req.userId!, isRead: false } });
    res.json({ success: true, data: notifications, meta: { unreadCount } });
  } catch (error) { next(error); }
});

router.patch("/read-all", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.userId!, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) { next(error); }
});

router.patch("/:id/read", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export { router as notificationRoutes };
