import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";
import { TaskPriorityEnum, TaskStatusEnum } from "@/lib/validations/task.schema";

const createTaskBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  status: TaskStatusEnum.default("BACKLOG"),
  priority: TaskPriorityEnum.default("MEDIUM"),
  projectId: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).default([]),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const tasks = await prisma.task.findMany({
      where: { project: { workspaceId: workspace.id }, isArchived: false },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true } },
        comments: { select: { id: true } },
        attachments: { select: { id: true } },
      },
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        projectId: task.projectId,
        project: task.project,
        assignee: task.assignee ? { name: task.assignee.name ?? "Member", image: task.assignee.image ?? undefined } : undefined,
        dueDate: task.dueDate ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(task.dueDate) : undefined,
        createdAt: task.createdAt.toISOString(),
        commentCount: task.comments.length,
        attachmentCount: task.attachments.length,
      })),
    });
  } catch (error) {
    console.error("[Tasks GET]", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, workspace } = await getRequestContext();
    const parsed = createTaskBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    let projectId = parsed.data.projectId;
    if (!projectId) {
      const project = await prisma.project.findFirst({ where: { workspaceId: workspace.id, isArchived: false }, orderBy: { createdAt: "desc" } });
      if (!project) return NextResponse.json({ error: "Create a project before adding tasks" }, { status: 400 });
      projectId = project.id;
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        projectId,
        creatorId: user.id,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        tags: parsed.data.tags,
      },
      include: {
        assignee: { select: { name: true, image: true } },
        comments: { select: { id: true } },
        attachments: { select: { id: true } },
      },
    });

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        assignee: task.assignee ? { name: task.assignee.name ?? "Member", image: task.assignee.image ?? undefined } : undefined,
        dueDate: task.dueDate ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(task.dueDate) : undefined,
        createdAt: task.createdAt.toISOString(),
        commentCount: task.comments.length,
        attachmentCount: task.attachments.length,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[Tasks POST]", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
