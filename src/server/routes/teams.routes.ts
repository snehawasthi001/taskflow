import { Router, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teams = await prisma.team.findMany({ include: { members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } }, _count: { select: { members: true, projects: true } } } });
    res.json({ success: true, data: teams });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, color, workspaceId } = req.body;
    const team = await prisma.team.create({ data: { name, description, color, workspaceId } });
    await prisma.teamMember.create({ data: { teamId: team.id, userId: req.userId!, role: "OWNER" } });
    res.status(201).json({ success: true, data: team });
  } catch (error) { next(error); }
});

router.post("/:id/members", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.create({ data: { teamId: req.params.id, userId: req.body.userId, role: req.body.role || "MEMBER" } });
    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
});

router.delete("/:id/members/:userId", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.teamMember.deleteMany({ where: { teamId: req.params.id, userId: req.params.userId } });
    res.json({ success: true, message: "Member removed" });
  } catch (error) { next(error); }
});

export { router as teamRoutes };
