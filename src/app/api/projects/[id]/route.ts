import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";

const updateProjectBody = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  teamId: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, workspace } = await getRequestContext();
    const { id } = await params;
    const parsed = updateProjectBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const existing = await prisma.project.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...parsed.data,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : parsed.data.endDate === null ? null : undefined,
      },
    });

    await prisma.auditLog.create({
      data: { action: "UPDATE", entityType: "Project", entityId: project.id, userId: user.id, details: parsed.data },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("[Project PATCH]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, workspace } = await getRequestContext();
    const { id } = await params;
    const existing = await prisma.project.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const project = await prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });

    await prisma.auditLog.create({
      data: { action: "ARCHIVE", entityType: "Project", entityId: project.id, userId: user.id, details: { name: project.name } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Project DELETE]", error);
    return NextResponse.json({ error: "Failed to archive project" }, { status: 500 });
  }
}
