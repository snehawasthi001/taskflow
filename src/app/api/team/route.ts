import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";

const inviteBody = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  focus: z.string().max(80).optional().default("Product"),
  teamId: z.string().optional(),
});

function roleToPrisma(role: "ADMIN" | "MEMBER" | "VIEWER") {
  return role === "ADMIN" ? Role.ADMIN : role === "VIEWER" ? Role.VIEWER : Role.MEMBER;
}

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Member";
  return source.trim().charAt(0).toUpperCase();
}

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const [workspaceMembers, teams] = await Promise.all([
      prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id },
        include: {
          user: {
            include: {
              assignedTasks: { select: { id: true, status: true } },
              teamMembers: { include: { team: true } },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.team.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" } }),
    ]);

    const members = workspaceMembers.map((member) => {
      const primaryTeam = member.user.teamMembers.find((teamMember) => teamMember.team.workspaceId === workspace.id)?.team;
      return {
        id: member.user.id,
        name: member.user.name ?? member.user.email,
        email: member.user.email,
        role: member.role,
        avatar: initials(member.user.name, member.user.email),
        status: "online",
        tasksCompleted: member.user.assignedTasks.filter((task) => task.status === "DONE").length,
        focus: primaryTeam?.name ?? "Workspace",
        teamId: primaryTeam?.id,
      };
    });

    return NextResponse.json({ members, teams });
  } catch (error) {
    console.error("[Team GET]", error);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user: inviter, workspace } = await getRequestContext();
    const parsed = inviteBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const role = roleToPrisma(parsed.data.role);
    const invitedUser = await prisma.user.upsert({
      where: { email: parsed.data.email },
      update: { name: parsed.data.name },
      create: { name: parsed.data.name, email: parsed.data.email, timezone: "Asia/Kolkata", bio: `${parsed.data.focus} contributor.` },
    });

    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: invitedUser.id } },
      update: { role },
      create: { workspaceId: workspace.id, userId: invitedUser.id, role },
    });

    let teamId = parsed.data.teamId;
    if (!teamId) {
      const existing = await prisma.team.findFirst({ where: { workspaceId: workspace.id, name: parsed.data.focus } });
      const team = existing ?? await prisma.team.create({ data: { name: parsed.data.focus, workspaceId: workspace.id, color: "#EC4899" } });
      teamId = team.id;
    }

    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: invitedUser.id } },
      update: { role },
      create: { teamId, userId: invitedUser.id, role },
    });

    await prisma.notification.createMany({
      data: [
        {
          type: "TEAM_INVITED",
          title: "Team invitation",
          message: `${inviter.name ?? inviter.email} invited you to ${workspace.name}.`,
          userId: invitedUser.id,
          link: "/team",
        },
        {
          type: "TEAM_INVITED",
          title: "Invitation sent",
          message: `Invitation sent to ${invitedUser.email}.`,
          userId: inviter.id,
          link: "/team",
        },
      ],
    });

    return NextResponse.json({
      member: {
        id: invitedUser.id,
        name: invitedUser.name ?? invitedUser.email,
        email: invitedUser.email,
        role,
        avatar: initials(invitedUser.name, invitedUser.email),
        status: "online",
        tasksCompleted: 0,
        focus: parsed.data.focus,
        teamId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[Team POST]", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}
