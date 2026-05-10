// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════════

import type {
  User,
  Task,
  Project,
  Team,
  Workspace,
  Comment,
  Notification,
  AuditLog,
  TaskStatus,
  TaskPriority,
  Role,
  NotificationType,
  AuditAction,
} from "@prisma/client";

// ── Re-exports ────────────────────────────────────────────────
export type {
  User,
  Task,
  Project,
  Team,
  Workspace,
  Comment,
  Notification,
  AuditLog,
  TaskStatus,
  TaskPriority,
  Role,
  NotificationType,
  AuditAction,
};

// ── Extended Types ────────────────────────────────────────────

export interface TaskWithRelations extends Task {
  project: Project;
  assignee: User | null;
  creator: User;
  comments: CommentWithAuthor[];
  subtasks: Task[];
  _count?: {
    comments: number;
    subtasks: number;
    attachments: number;
  };
}

export interface CommentWithAuthor extends Comment {
  author: User;
  replies?: CommentWithAuthor[];
}

export interface ProjectWithRelations extends Project {
  team: Team | null;
  tasks: Task[];
  _count?: {
    tasks: number;
  };
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithUser[];
  _count?: {
    members: number;
    projects: number;
  };
}

export interface TeamMemberWithUser {
  id: string;
  role: Role;
  joinedAt: Date;
  user: User;
}

export interface WorkspaceWithRelations extends Workspace {
  members: WorkspaceMemberWithUser[];
  teams: Team[];
  projects: Project[];
}

export interface WorkspaceMemberWithUser {
  id: string;
  role: Role;
  joinedAt: Date;
  user: User;
}

// ── API Types ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  isOverdue?: boolean;
}

export interface ProjectFilters extends PaginationParams {
  teamId?: string;
  isArchived?: boolean;
  search?: string;
}

// ── WebSocket Events ──────────────────────────────────────────

export interface ServerToClientEvents {
  "task:created": (task: TaskWithRelations) => void;
  "task:updated": (task: TaskWithRelations) => void;
  "task:deleted": (taskId: string) => void;
  "task:moved": (data: { taskId: string; fromStatus: TaskStatus; toStatus: TaskStatus; position: number }) => void;
  "comment:created": (comment: CommentWithAuthor) => void;
  "notification:new": (notification: Notification) => void;
  "user:presence": (data: { userId: string; status: "online" | "offline" }) => void;
  "project:updated": (project: ProjectWithRelations) => void;
}

export interface ClientToServerEvents {
  "join:project": (projectId: string) => void;
  "leave:project": (projectId: string) => void;
  "join:user": (userId: string) => void;
  "task:subscribe": (taskId: string) => void;
  "task:unsubscribe": (taskId: string) => void;
}

// ── UI Types ──────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  icon: string;
  tasks: TaskWithRelations[];
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksCreatedThisWeek: number;
  tasksCompletedThisWeek: number;
}

export interface ActivityItem {
  id: string;
  type: AuditAction;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  user: { id: string; name: string; image: string | null };
  createdAt: string;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category: "task" | "project" | "navigation" | "action";
  action: () => void;
}
