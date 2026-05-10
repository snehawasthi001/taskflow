import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";

const updateMemberBody = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await getRequestContext();
    const { id } = await params;
    const parsed = updateMemberBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: id } },
      data: { role: parsed.data.role },
    });

    const teamMembers = await prisma.teamMember.findMany({ where: { userId: id, team: { workspaceId: workspace.id } } });
    await prisma.$transaction(teamMembers.map((member) => prisma.teamMember.update({ where: { id: member.id }, data: { role: parsed.data.role } })));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Team member PATCH]", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await getRequestContext();
    const { id } = await params;

    await prisma.teamMember.deleteMany({ where: { userId: id, team: { workspaceId: workspace.id } } });
    await prisma.workspaceMember.delete({ where: { workspaceId_userId: { workspaceId: workspace.id, userId: id } } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Team member DELETE]", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
