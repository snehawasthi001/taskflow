// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Task Service
//  All task CRUD + move + assign + bulk + search
// ═══════════════════════════════════════════════════════════════

import prisma from "../../lib/prisma";
import { cacheInvalidatePattern } from "../../lib/redis";
import type { CreateTaskInput, UpdateTaskInput, TaskFilterInput, MoveTaskInput } from "../../lib/validations/task.schema";
import type { Prisma } from "@prisma/client";

export class TaskService {
  async findAll(filters: TaskFilterInput, userId: string) {
    void userId;
    const { page, limit, sortBy, sortOrder, status, priority, assigneeId, projectId, search, tags } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      isArchived: false,
      ...(status && { status: Array.isArray(status) ? { in: status } : status }),
      ...(priority && { priority: Array.isArray(priority) ? { in: priority } : priority }),
      ...(assigneeId && { assigneeId }),
      ...(projectId && { projectId }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, name: true, email: true, image: true } },
          creator: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, subtasks: true, attachments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return prisma.task.findUniqueOrThrow({
      where: { id },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        comments: {
          include: { author: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        subtasks: true,
        attachments: true,
        _count: { select: { comments: true, subtasks: true, attachments: true } },
      },
    });
  }

  async create(data: CreateTaskInput, creatorId: string) {
    const maxPosition = await prisma.task.aggregate({
      where: { projectId: data.projectId, status: data.status },
      _max: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        creatorId,
        position: (maxPosition._max.position ?? -1) + 1,
      },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, subtasks: true, attachments: true } },
      },
    });

    await cacheInvalidatePattern("tasks:*");
    return task;
  }

  async update(id: string, data: UpdateTaskInput) {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        completedAt: data.status === "DONE" ? new Date() : undefined,
      },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, subtasks: true, attachments: true } },
      },
    });

    await cacheInvalidatePattern("tasks:*");
    return task;
  }

  async move(id: string, data: MoveTaskInput) {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: data.status,
        position: data.position,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
    });
    await cacheInvalidatePattern("tasks:*");
    return task;
  }

  async delete(id: string) {
    await prisma.task.delete({ where: { id } });
    await cacheInvalidatePattern("tasks:*");
  }

  async bulkUpdate(taskIds: string[], updates: Prisma.TaskUpdateInput) {
    const result = await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: updates,
    });
    await cacheInvalidatePattern("tasks:*");
    return result;
  }

  async getStats(projectId?: string) {
    const where = projectId ? { projectId } : {};
    const [total, completed, overdue, inProgress] = await Promise.all([
      prisma.task.count({ where: { ...where, isArchived: false } }),
      prisma.task.count({ where: { ...where, status: "DONE" } }),
      prisma.task.count({ where: { ...where, dueDate: { lt: new Date() }, status: { not: "DONE" } } }),
      prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
    ]);
    return { total, completed, overdue, inProgress, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }
}

export const taskService = new TaskService();
