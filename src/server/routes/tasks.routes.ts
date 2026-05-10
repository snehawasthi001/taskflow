import { Router, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { auditMiddleware } from "../middleware/audit.middleware";
import { createTaskSchema, updateTaskSchema, moveTaskSchema, taskFilterSchema, bulkUpdateTaskSchema } from "../../lib/validations/task.schema";

const router = Router();

// All task routes require auth
router.use(authMiddleware);
router.use(auditMiddleware("task"));

// GET /api/v1/tasks — List tasks with filters
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filters = taskFilterSchema.parse(req.query);
    const result = await taskService.findAll(filters, req.userId!);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

// GET /api/v1/tasks/stats — Task statistics
router.get("/stats", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await taskService.getStats(req.query.projectId as string);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

// GET /api/v1/tasks/:id — Get single task
router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.findById(req.params.id);
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

// POST /api/v1/tasks — Create task
router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await taskService.create(data, req.userId!);
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
});

// PATCH /api/v1/tasks/:id — Update task
router.patch("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    const task = await taskService.update(req.params.id, data);
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

// PATCH /api/v1/tasks/:id/move — Move task (status + position)
router.patch("/:id/move", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = moveTaskSchema.parse(req.body);
    const task = await taskService.move(req.params.id, data);
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

// POST /api/v1/tasks/bulk — Bulk update
router.post("/bulk", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskIds, updates } = bulkUpdateTaskSchema.parse(req.body);
    const result = await taskService.bulkUpdate(taskIds, updates);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// DELETE /api/v1/tasks/:id — Delete task
router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await taskService.delete(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) { next(error); }
});

export { router as taskRoutes };
