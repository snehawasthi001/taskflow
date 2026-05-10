"use client";

import { KanbanColumn } from "./KanbanColumn";

export const KANBAN_COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "hsl(var(--text-muted))" },
  { id: "TODO", title: "To Do", color: "hsl(var(--info))" },
  { id: "IN_PROGRESS", title: "In Progress", color: "hsl(var(--warning))" },
  { id: "IN_REVIEW", title: "In Review", color: "hsl(var(--accent))" },
  { id: "TESTING", title: "Testing", color: "hsl(var(--chart-5))" },
  { id: "DONE", title: "Done", color: "hsl(var(--success))" },
];

export type KanbanTask = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority: string;
  tags: string[];
  assignee?: { name: string; image?: string };
  dueDate?: string;
  createdAt?: string;
  commentCount?: number;
  attachmentCount?: number;
};

export type KanbanTasksByStatus = Record<string, KanbanTask[]>;

export const DEFAULT_TASKS_BY_STATUS: KanbanTasksByStatus = {
  BACKLOG: [
    { id: "t1", title: "Research GraphQL subscriptions for real-time updates", priority: "LOW", tags: ["research"], dueDate: "May 15", commentCount: 2 },
    { id: "t2", title: "Design dark mode color palette variations", priority: "MEDIUM", tags: ["design", "UI"], assignee: { name: "Sarah" } },
  ],
  TODO: [
    { id: "t3", title: "Implement user role-based access control", priority: "HIGH", tags: ["auth", "security"], assignee: { name: "Alex" }, dueDate: "May 10", commentCount: 5 },
    { id: "t4", title: "Add email notification templates", priority: "MEDIUM", tags: ["email"], dueDate: "May 12" },
    { id: "t5", title: "Create API rate limiting middleware", priority: "HIGH", tags: ["API"], assignee: { name: "Mike" } },
  ],
  IN_PROGRESS: [
    { id: "t6", title: "Build Kanban board drag-and-drop system", priority: "CRITICAL", tags: ["frontend", "DnD"], assignee: { name: "Lisa" }, dueDate: "May 8", commentCount: 8, attachmentCount: 2 },
    { id: "t7", title: "Integrate Prometheus metrics endpoint", priority: "HIGH", tags: ["monitoring"], assignee: { name: "Dev" } },
  ],
  IN_REVIEW: [
    { id: "t8", title: "WebSocket real-time notification system", priority: "HIGH", tags: ["websocket"], assignee: { name: "Alex" }, commentCount: 3 },
  ],
  TESTING: [
    { id: "t9", title: "User authentication flow - OAuth + Credentials", priority: "CRITICAL", tags: ["auth", "testing"], assignee: { name: "Sarah" }, dueDate: "May 7", commentCount: 12 },
  ],
  DONE: [
    { id: "t10", title: "Set up Prisma schema with PostgreSQL", priority: "HIGH", tags: ["database"], assignee: { name: "Mike" }, commentCount: 4 },
    { id: "t11", title: "Configure Docker multi-stage build", priority: "MEDIUM", tags: ["DevOps"], assignee: { name: "Dev" } },
    { id: "t12", title: "Design glassmorphic component library", priority: "HIGH", tags: ["design", "UI"], assignee: { name: "Lisa" }, attachmentCount: 5 },
  ],
};

interface KanbanBoardProps {
  tasksByStatus?: KanbanTasksByStatus;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (status: string) => void;
}

export function KanbanBoard({ tasksByStatus = DEFAULT_TASKS_BY_STATUS, onTaskClick, onAddTask }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto rounded-[28px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.42)] p-3 pb-4 shadow-xl shadow-black/5 backdrop-blur-2xl scrollbar-thin">
      {KANBAN_COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          title={col.title}
          color={col.color}
          tasks={tasksByStatus[col.id] || []}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask?.(col.id)}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
