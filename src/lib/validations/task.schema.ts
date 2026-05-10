// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Zod Validation Schemas: Tasks
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "TESTING",
  "DONE",
]);

export const TaskPriorityEnum = z.enum([
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "NONE",
]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z.string().max(10000).optional(),
  status: TaskStatusEnum.optional().default("BACKLOG"),
  priority: TaskPriorityEnum.optional().default("MEDIUM"),
  projectId: z.string().cuid("Invalid project ID"),
  assigneeId: z.string().cuid("Invalid assignee ID").optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().min(0).max(999).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  parentId: z.string().cuid("Invalid parent task ID").optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  position: z.number().int().min(0).optional(),
  actualHours: z.number().min(0).max(9999).optional().nullable(),
});

export const moveTaskSchema = z.object({
  status: TaskStatusEnum,
  position: z.number().int().min(0),
});

export const bulkUpdateTaskSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1).max(50),
  updates: z.object({
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    assigneeId: z.string().cuid().optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
  }),
});

export const taskFilterSchema = z.object({
  status: z.union([TaskStatusEnum, z.array(TaskStatusEnum)]).optional(),
  priority: z.union([TaskPriorityEnum, z.array(TaskPriorityEnum)]).optional(),
  assigneeId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(200).optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  isOverdue: z.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type BulkUpdateTaskInput = z.infer<typeof bulkUpdateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
