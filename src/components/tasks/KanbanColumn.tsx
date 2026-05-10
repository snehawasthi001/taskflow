"use client";

import { motion } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    tags: string[];
    assignee?: { name: string; image?: string };
    dueDate?: string;
    commentCount?: number;
    attachmentCount?: number;
  }>;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: () => void;
}

export function KanbanColumn({ title, color, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  return (
    <div className="w-[310px] flex-shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_currentColor]" style={{ background: color, color }} />
          <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</h3>
          <span className="rounded-full bg-[hsl(var(--surface-active))] px-2 py-0.5 text-xs text-[hsl(var(--text-muted))]">{tasks.length}</span>
        </div>
        <button aria-label={`Add task to ${title}`} onClick={onAddTask} className="rounded-full p-1.5 text-[hsl(var(--text-muted))] transition-colors hover:bg-[hsl(var(--surface-active))] hover:text-[hsl(var(--text-primary))]">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-[520px] space-y-3 rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.54)] p-2">
        {tasks.map((task, idx) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <TaskCard task={task} onClick={() => onTaskClick?.(task.id)} />
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center text-sm text-[hsl(var(--text-muted))]">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
