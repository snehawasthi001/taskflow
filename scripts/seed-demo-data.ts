// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Demo Data Seed Script
//  Creates: 1 workspace, 2 teams, 5 users, 3 projects, 20 tasks
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use direct URL (non-pooler) for seeding — more reliable for bulk operations
const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const passwordHash = await bcrypt.hash("Password123", 12);
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Alex Chen", email: "alex@taskflow.dev", passwordHash, image: null } }),
    prisma.user.create({ data: { name: "Sarah Kim", email: "sarah@taskflow.dev", passwordHash, image: null } }),
    prisma.user.create({ data: { name: "Mike Ross", email: "mike@taskflow.dev", passwordHash, image: null } }),
    prisma.user.create({ data: { name: "Lisa Wang", email: "lisa@taskflow.dev", passwordHash, image: null } }),
    prisma.user.create({ data: { name: "Dev Patel", email: "dev@taskflow.dev", passwordHash, image: null } }),
  ]);
  console.log(`  ✅ Created ${users.length} users (password: Password123)`);

  // Workspace
  const workspace = await prisma.workspace.create({
    data: { name: "TaskFlow HQ", slug: "taskflow-hq", description: "Main workspace" },
  });
  await Promise.all(users.map((u, i) =>
    prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: u.id, role: i === 0 ? "OWNER" : i === 1 ? "ADMIN" : "MEMBER" },
    })
  ));
  console.log("  ✅ Created workspace + members");

  // Teams
  const [designTeam, backendTeam] = await Promise.all([
    prisma.team.create({ data: { name: "Design", description: "UI/UX team", color: "#6366F1", workspaceId: workspace.id } }),
    prisma.team.create({ data: { name: "Backend", description: "API & infra", color: "#10B981", workspaceId: workspace.id } }),
  ]);
  await Promise.all([
    prisma.teamMember.create({ data: { teamId: designTeam.id, userId: users[0].id, role: "OWNER" } }),
    prisma.teamMember.create({ data: { teamId: designTeam.id, userId: users[3].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: backendTeam.id, userId: users[1].id, role: "OWNER" } }),
    prisma.teamMember.create({ data: { teamId: backendTeam.id, userId: users[2].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: backendTeam.id, userId: users[4].id, role: "MEMBER" } }),
  ]);
  console.log("  ✅ Created 2 teams");

  // Projects
  const projects = await Promise.all([
    prisma.project.create({ data: { name: "Frontend Redesign", description: "Complete glassmorphic UI overhaul", color: "#6366F1", icon: "palette", workspaceId: workspace.id, teamId: designTeam.id } }),
    prisma.project.create({ data: { name: "API v2", description: "New REST API with breaking changes", color: "#10B981", icon: "server", workspaceId: workspace.id, teamId: backendTeam.id } }),
    prisma.project.create({ data: { name: "DevOps Pipeline", description: "CI/CD, Docker, K8s setup", color: "#F59E0B", icon: "settings", workspaceId: workspace.id, teamId: backendTeam.id } }),
  ]);
  console.log(`  ✅ Created ${projects.length} projects`);

  // Tasks
  const taskData = [
    { title: "Design glassmorphic component library", status: "DONE", priority: "HIGH", projectId: projects[0].id, assigneeId: users[3].id, tags: ["design", "UI"] },
    { title: "Implement dark/light theme toggle", status: "DONE", priority: "MEDIUM", projectId: projects[0].id, assigneeId: users[0].id, tags: ["frontend"] },
    { title: "Build Kanban board with drag-and-drop", status: "IN_PROGRESS", priority: "CRITICAL", projectId: projects[0].id, assigneeId: users[3].id, tags: ["frontend", "DnD"] },
    { title: "Create login/register pages", status: "IN_REVIEW", priority: "HIGH", projectId: projects[0].id, assigneeId: users[0].id, tags: ["auth", "UI"] },
    { title: "Responsive sidebar navigation", status: "DONE", priority: "MEDIUM", projectId: projects[0].id, assigneeId: users[3].id, tags: ["layout"] },
    { title: "Analytics dashboard charts", status: "TODO", priority: "MEDIUM", projectId: projects[0].id, assigneeId: users[0].id, tags: ["charts"] },
    { title: "Command palette (Cmd+K)", status: "DONE", priority: "LOW", projectId: projects[0].id, assigneeId: users[3].id, tags: ["UX"] },
    { title: "Set up Prisma schema", status: "DONE", priority: "HIGH", projectId: projects[1].id, assigneeId: users[2].id, tags: ["database"] },
    { title: "Implement task CRUD API", status: "DONE", priority: "HIGH", projectId: projects[1].id, assigneeId: users[1].id, tags: ["API"] },
    { title: "WebSocket real-time notifications", status: "IN_PROGRESS", priority: "HIGH", projectId: projects[1].id, assigneeId: users[4].id, tags: ["websocket"] },
    { title: "Rate limiting middleware", status: "TODO", priority: "MEDIUM", projectId: projects[1].id, assigneeId: users[2].id, tags: ["security"] },
    { title: "Zod validation schemas", status: "DONE", priority: "MEDIUM", projectId: projects[1].id, assigneeId: users[1].id, tags: ["validation"] },
    { title: "JWT authentication flow", status: "TESTING", priority: "CRITICAL", projectId: projects[1].id, assigneeId: users[1].id, tags: ["auth"] },
    { title: "Search API endpoint", status: "TODO", priority: "LOW", projectId: projects[1].id, assigneeId: users[4].id, tags: ["search"] },
    { title: "Configure Docker multi-stage build", status: "DONE", priority: "HIGH", projectId: projects[2].id, assigneeId: users[4].id, tags: ["Docker"] },
    { title: "Jenkins 8-stage pipeline", status: "IN_PROGRESS", priority: "HIGH", projectId: projects[2].id, assigneeId: users[4].id, tags: ["CI/CD"] },
    { title: "Kubernetes manifests + Helm chart", status: "TODO", priority: "HIGH", projectId: projects[2].id, assigneeId: users[2].id, tags: ["K8s"] },
    { title: "Terraform AWS infrastructure", status: "BACKLOG", priority: "MEDIUM", projectId: projects[2].id, assigneeId: users[2].id, tags: ["IaC"] },
    { title: "Prometheus + Grafana monitoring", status: "BACKLOG", priority: "MEDIUM", projectId: projects[2].id, assigneeId: users[4].id, tags: ["monitoring"] },
    { title: "Trivy security scanning", status: "TODO", priority: "HIGH", projectId: projects[2].id, assigneeId: users[4].id, tags: ["security"] },
  ];

  const tasks = await Promise.all(
    taskData.map((t, i) =>
      prisma.task.create({
        data: {
          ...t,
          status: t.status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "TESTING" | "DONE",
          priority: t.priority as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
          creatorId: users[0].id,
          position: i,
          completedAt: t.status === "DONE" ? new Date() : null,
        },
      })
    )
  );
  console.log(`  ✅ Created ${tasks.length} tasks`);

  // Comments
  const comments = await Promise.all([
    prisma.comment.create({ data: { content: "Looking great! The glass effects are stunning.", taskId: tasks[0].id, authorId: users[0].id } }),
    prisma.comment.create({ data: { content: "Need to add keyboard shortcuts for column switching.", taskId: tasks[2].id, authorId: users[1].id } }),
    prisma.comment.create({ data: { content: "Tests passing with 85% coverage 🎉", taskId: tasks[8].id, authorId: users[2].id } }),
    prisma.comment.create({ data: { content: "WebSocket reconnection logic needs work.", taskId: tasks[9].id, authorId: users[4].id } }),
    prisma.comment.create({ data: { content: "JWT refresh token flow working now.", taskId: tasks[12].id, authorId: users[1].id } }),
    prisma.comment.create({ data: { content: "Docker image size reduced to 180MB 🚀", taskId: tasks[14].id, authorId: users[4].id } }),
    prisma.comment.create({ data: { content: "Added health check endpoints.", taskId: tasks[14].id, authorId: users[2].id } }),
    prisma.comment.create({ data: { content: "SonarQube quality gate configured.", taskId: tasks[15].id, authorId: users[4].id } }),
    prisma.comment.create({ data: { content: "Need to add Trivy scan to the pipeline.", taskId: tasks[15].id, authorId: users[2].id } }),
    prisma.comment.create({ data: { content: "Helm chart values look good for staging.", taskId: tasks[16].id, authorId: users[4].id } }),
  ]);
  console.log(`  ✅ Created ${comments.length} comments`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("   Login with: alex@taskflow.dev / Password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
