// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Zod Validation Schemas: Projects
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Name must be under 100 characters"),
  description: z.string().max(2000).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#8B5CF6"),
  icon: z.string().max(50).optional().default("folder"),
  workspaceId: z.string().cuid("Invalid workspace ID"),
  teamId: z.string().cuid("Invalid team ID").optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const projectFilterSchema = z.object({
  teamId: z.string().cuid().optional(),
  isArchived: z.boolean().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
