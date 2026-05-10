"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DEFAULT_TASKS_BY_STATUS,
  KANBAN_COLUMNS,
  KanbanBoard,
  type KanbanTask,
  type KanbanTasksByStatus,
} from "@/components/tasks/KanbanBoard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { TaskForm } from "@/components/tasks/TaskForm";
import { GlassButton } from "@/components/ui/GlassButton";
import { Filter, LayoutGrid, List, Plus, Sparkles } from "lucide-react";

const priorityRank: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NONE: 4,
};

function cloneTasks(tasks: KanbanTasksByStatus): KanbanTasksByStatus {
  return Object.fromEntries(
    Object.entries(tasks).map(([status, statusTasks]) => [
      status,
      statusTasks.map((task) => ({ ...task, status })),
    ])
  );
}

function taskOrder(task: KanbanTask) {
  const numericId = Number(task.id.replace(/\D/g, ""));
  return Number.isFinite(numericId) ? numericId : 0;
}

function dueOrder(task: KanbanTask) {
  if (!task.dueDate) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(`${task.dueDate}, 2026`);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasksByStatus, setTasksByStatus] = useState<KanbanTasksByStatus>(() => cloneTasks(DEFAULT_TASKS_BY_STATUS));
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createStatus, setCreateStatus] = useState("BACKLOG");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ priority: "ALL", sort: "newest" });
  const queryWantsNewTask = searchParams.get("new") === "true";
  const isCreateFormOpen = showCreateForm || queryWantsNewTask;

  useEffect(() => {
    let isMounted = true;
    fetch("/api/tasks")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load tasks");
        return data as { tasks: KanbanTask[] };
      })
      .then(({ tasks }) => {
        if (!isMounted) return;
        const grouped: KanbanTasksByStatus = {};
        KANBAN_COLUMNS.forEach((column) => {
          grouped[column.id] = [];
        });
        tasks.forEach((task) => {
          const status = task.status || "BACKLOG";
          grouped[status] = [task, ...(grouped[status] || [])];
        });
        setTasksByStatus(grouped);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load tasks"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleTasksByStatus = useMemo(() => {
    const query = search.trim().toLowerCase();
    const next: KanbanTasksByStatus = {};

    KANBAN_COLUMNS.forEach((column) => {
      const filtered = (tasksByStatus[column.id] || [])
        .filter((task) => {
          const matchesSearch =
            !query ||
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags.some((tag) => tag.toLowerCase().includes(query));
          const matchesPriority = filters.priority === "ALL" || task.priority === filters.priority;
          return matchesSearch && matchesPriority;
        })
        .sort((a, b) => {
          if (filters.sort === "priority") return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
          if (filters.sort === "due") return dueOrder(a) - dueOrder(b);
          if (filters.sort === "oldest") return taskOrder(a) - taskOrder(b);
          return taskOrder(b) - taskOrder(a);
        });

      next[column.id] = filtered.map((task) => ({ ...task, status: column.id }));
    });

    return next;
  }, [filters.priority, filters.sort, search, tasksByStatus]);

  const visibleTasks = useMemo(
    () => KANBAN_COLUMNS.flatMap((column) => visibleTasksByStatus[column.id] || []),
    [visibleTasksByStatus]
  );

  const selectedTask = useMemo(
    () => KANBAN_COLUMNS.flatMap((column) => (tasksByStatus[column.id] || []).map((task) => ({ ...task, status: column.id }))).find((task) => task.id === selectedTaskId),
    [selectedTaskId, tasksByStatus]
  );

  const openCreateForm = (status = "BACKLOG") => {
    setCreateStatus(status);
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    if (queryWantsNewTask) router.replace("/tasks", { scroll: false });
  };

  const handleCreateTask = (data: { title: string; description: string; priority: string; status: string }) => {
    const status = data.status || createStatus;
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, status, tags: ["new"] }),
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Failed to create task");
        return body as { task: KanbanTask };
      })
      .then(({ task }) => {
        const taskStatus = task.status || status;
        setTasksByStatus((current) => ({
          ...current,
          [taskStatus]: [task, ...(current[taskStatus] || [])],
        }));
        toast.success("Task created", { description: `"${task.title}" was added to ${taskStatus.replace(/_/g, " ").toLowerCase()}.` });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to create task"));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="premium-card p-5 md:p-6">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
              <Sparkles className="h-4 w-4" />
              Board
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">Tasks</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--text-secondary))]">
              A polished operating board for triage, ownership, delivery risk, and review flow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--text-secondary))] transition hover:text-[hsl(var(--text-primary))]"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <div className="flex items-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover))] p-1">
              <button
                aria-label="Kanban view"
                type="button"
                onClick={() => setView("kanban")}
                className={`rounded-full p-2 transition-all ${view === "kanban" ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] shadow-sm" : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                aria-label="List view"
                type="button"
                onClick={() => setView("list")}
                className={`rounded-full p-2 transition-all ${view === "list" ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] shadow-sm" : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => openCreateForm()}>
              New Task
            </GlassButton>
          </div>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TaskFilters onSearchChange={setSearch} onFilterChange={(nextFilters) => setFilters((current) => ({ ...current, ...nextFilters }))} />
          </motion.div>
        )}
      </AnimatePresence>

      {view === "kanban" ? (
        <div className="content-container-lg !max-w-none !px-0">
          {loading && (
            <div className="mb-3 rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] px-4 py-3 text-sm text-[hsl(var(--text-muted))]">
              Loading tasks from the database...
            </div>
          )}
          <KanbanBoard tasksByStatus={visibleTasksByStatus} onTaskClick={setSelectedTaskId} onAddTask={openCreateForm} />
        </div>
      ) : (
        <section className="premium-card p-3">
          <div className="relative z-10 divide-y divide-[hsl(var(--border-subtle))]">
            {visibleTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className="grid w-full gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-[hsl(var(--surface-hover)/0.72)] md:grid-cols-[1fr_140px_130px_120px]"
              >
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">{task.title}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">{task.description || task.tags.join(", ") || "No description"}</p>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--text-secondary))]">{task.status?.replace(/_/g, " ")}</span>
                <span className="text-sm font-semibold text-[hsl(var(--text-secondary))]">{task.priority}</span>
                <span className="text-sm text-[hsl(var(--text-muted))]">{task.dueDate || "No due date"}</span>
              </button>
            ))}
            {visibleTasks.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-[hsl(var(--text-muted))]">
                No tasks match the current filters.
              </div>
            )}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTaskId(null)} />}
      </AnimatePresence>
      {isCreateFormOpen && (
        <TaskForm
          key={createStatus}
          isOpen={isCreateFormOpen}
          onClose={closeCreateForm}
          defaultStatus={queryWantsNewTask ? "BACKLOG" : createStatus}
          onSubmit={handleCreateTask}
        />
      )}
    </motion.div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageContent />
    </Suspense>
  );
}
