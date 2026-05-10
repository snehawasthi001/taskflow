import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";

type ProjectWithRelations = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  teamId: string | null;
  isArchived: boolean;
  endDate: Date | null;
  createdAt: Date;
  team: { name: string } | null;
  tasks: Array<{ id: string; status: string }>;
};

const createProjectBody = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  teamId: z.string().optional().nullable(),
  teamName: z.string().max(100).optional(),
  endDate: z.string().optional().nullable(),
  color: z.string().optional().default("#EC4899"),
});

function toProjectDto(project: ProjectWithRelations) {
  const taskCount = project.tasks?.length ?? 0;
  const completedCount = project.tasks?.filter((task) => task.status === "DONE").length ?? 0;
  const dueDate = project.endDate
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(project.endDate)
    : "No date";

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    color: project.color,
    teamId: project.teamId,
    team: project.team?.name ?? "Unassigned",
    taskCount,
    completedCount,
    due: dueDate,
    health: project.isArchived ? "Archived" : completedCount / Math.max(taskCount, 1) > 0.7 ? "Ahead" : "On track",
    createdAt: project.createdAt,
  };
}

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id, isArchived: false },
      include: { team: true, tasks: { select: { id: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects: projects.map(toProjectDto) });
  } catch (error) {
    console.error("[Projects GET]", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, workspace } = await getRequestContext();
    const parsed = createProjectBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    let teamId = parsed.data.teamId ?? null;
    if (!teamId && parsed.data.teamName) {
      const team = await prisma.team.create({
        data: {
          name: parsed.data.teamName,
          workspaceId: workspace.id,
          color: parsed.data.color,
          members: { create: { userId: user.id, role: "ADMIN" } },
        },
      });
      teamId = team.id;
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        workspaceId: workspace.id,
        teamId,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        tasks: {
          create: {
            title: "Project kickoff",
            description: "Initial planning task created with the project.",
            creatorId: user.id,
            status: "TODO",
            priority: "MEDIUM",
            tags: ["kickoff"],
          },
        },
      },
      include: { team: true, tasks: { select: { id: true, status: true } } },
    });

    await prisma.auditLog.create({
      data: { action: "CREATE", entityType: "Project", entityId: project.id, userId: user.id, details: { name: project.name } },
    });

    return NextResponse.json({ project: toProjectDto(project) }, { status: 201 });
  } catch (error) {
    console.error("[Projects POST]", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
