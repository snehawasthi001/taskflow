import { Role, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const workspaceSlug = "taskflow-command-os";

export async function getCurrentUser() {
  const session = await auth().catch(() => null);
  const sessionUserId = session?.user?.id;

  if (sessionUserId) {
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (user) return user;
  }

  const passwordHash = await bcrypt.hash("DemoUser123", 12);
  return prisma.user.upsert({
    where: { email: "alex@taskflow.dev" },
    update: {},
    create: {
      name: "Alex Chen",
      email: "alex@taskflow.dev",
      passwordHash,
      bio: "Product and engineering operator focused on calm delivery systems.",
      timezone: "Asia/Kolkata",
    },
  });
}

export async function getWorkspaceForUser(userId: string) {
  const existingMembership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  if (existingMembership) return existingMembership.workspace;

  const workspace = await prisma.workspace.upsert({
    where: { slug: workspaceSlug },
    update: {},
    create: {
      name: "TaskFlow Command OS",
      slug: workspaceSlug,
      description: "Production workspace for projects, teams, tasks, and delivery intelligence.",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
    update: { role: Role.OWNER },
    create: { workspaceId: workspace.id, userId, role: Role.OWNER },
  });

  return workspace;
}

export async function ensureWorkspaceData(userId: string) {
  const workspace = await getWorkspaceForUser(userId);

  const teamCount = await prisma.team.count({ where: { workspaceId: workspace.id } });
  if (teamCount === 0) {
    const teams = await prisma.$transaction([
      prisma.team.create({ data: { name: "Design Systems", description: "Interface craft, accessibility, and motion.", color: "#EC4899", workspaceId: workspace.id } }),
      prisma.team.create({ data: { name: "Platform", description: "APIs, reliability, and data systems.", color: "#F97316", workspaceId: workspace.id } }),
      prisma.team.create({ data: { name: "Mobile", description: "Native delivery and workspace sync.", color: "#10B981", workspaceId: workspace.id } }),
    ]);

    await prisma.$transaction(
      teams.map((team) =>
        prisma.teamMember.create({
          data: { teamId: team.id, userId, role: team.name === "Design Systems" ? Role.OWNER : Role.ADMIN },
        })
      )
    );
  }

  const projectCount = await prisma.project.count({ where: { workspaceId: workspace.id } });
  if (projectCount === 0) {
    const teams = await prisma.team.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "asc" } });
    const [designTeam, platformTeam, mobileTeam] = teams;

    const projects = await prisma.$transaction([
      prisma.project.create({
        data: {
          name: "Frontend Redesign",
          description: "Premium UI overhaul, motion language, accessibility pass, and design system polish.",
          color: "#EC4899",
          workspaceId: workspace.id,
          teamId: designTeam?.id,
          endDate: new Date("2026-05-10T12:00:00.000Z"),
        },
      }),
      prisma.project.create({
        data: {
          name: "API v2 Migration",
          description: "Versioned endpoints, audit trails, search, notifications, and backwards-compatible rollout.",
          color: "#F97316",
          workspaceId: workspace.id,
          teamId: platformTeam?.id,
          endDate: new Date("2026-05-16T12:00:00.000Z"),
        },
      }),
      prisma.project.create({
        data: {
          name: "Mobile App",
          description: "React Native beta with offline board sync, push notifications, and workspace switching.",
          color: "#10B981",
          workspaceId: workspace.id,
          teamId: mobileTeam?.id,
          endDate: new Date("2026-05-22T12:00:00.000Z"),
        },
      }),
    ]);

    await prisma.$transaction(
      projects.flatMap((project, projectIndex) =>
        Array.from({ length: 6 + projectIndex * 2 }, (_, index) =>
          prisma.task.create({
            data: {
              title: `${project.name} milestone ${index + 1}`,
              description: "Persisted production task created during workspace bootstrap.",
              status: index < 2 ? TaskStatus.DONE : index < 4 ? TaskStatus.IN_PROGRESS : TaskStatus.BACKLOG,
              priority: index % 3 === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
              position: index,
              projectId: project.id,
              creatorId: userId,
              tags: [project.name.split(" ")[0].toLowerCase()],
            },
          })
        )
      )
    );
  }

  return workspace;
}

export async function getRequestContext() {
  const user = await getCurrentUser();
  const workspace = await ensureWorkspaceData(user.id);
  return { user, workspace };
}
