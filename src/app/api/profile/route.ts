import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/user.schema";

export async function GET() {
  try {
    const { user, workspace } = await getRequestContext();
    const [workspaceMemberships, teamMemberships, taskStats, projectStats] = await Promise.all([
      prisma.workspaceMember.findMany({ where: { userId: user.id }, include: { workspace: true } }),
      prisma.teamMember.findMany({ where: { userId: user.id }, include: { team: true } }),
      prisma.task.groupBy({ by: ["status"], where: { OR: [{ assigneeId: user.id }, { creatorId: user.id }] }, _count: true }),
      prisma.project.count({ where: { workspaceId: workspace.id, isArchived: false } }),
    ]);

    return NextResponse.json({
      user,
      workspace,
      workspaceMemberships,
      teamMemberships,
      stats: {
        projects: projectStats,
        tasks: taskStats.reduce<Record<string, number>>((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("[Profile GET]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await getRequestContext();
    const body = await req.json();
    const parsed = updateProfileSchema.extend({ email: z.string().email().optional() }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, image: true, bio: true, timezone: true, updatedAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[Profile PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
