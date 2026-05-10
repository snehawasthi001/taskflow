"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { PriorityBadge, StatusBadge } from "@/components/ui/GlassBadge";
import { X, Calendar, User, MessageSquare, Clock, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import { GlassDropdown } from "@/components/ui/GlassDropdown";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    tags: string[];
    assignee?: { name: string };
    dueDate?: string;
    createdAt?: string;
  };
  onClose: () => void;
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 border-l border-[hsl(var(--border))] overflow-y-auto"
      style={{ background: "hsl(var(--surface-elevated))" }}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[hsl(var(--border-subtle))]" style={{ background: "hsl(var(--surface-elevated))" }}>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-1">
          <GlassDropdown
            align="right"
            trigger={<button className="p-2 rounded-lg hover:bg-glass-100 text-[hsl(var(--text-muted))]"><MoreHorizontal className="w-4 h-4" /></button>}
            items={[
              { id: "edit", label: "Edit", icon: <Edit3 className="w-4 h-4" />, onClick: () => {} },
              { id: "div", label: "", divider: true },
              { id: "delete", label: "Delete", icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => {} },
            ]}
          />
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-glass-100 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold text-[hsl(var(--text-primary))]">{task.title}</h1>

        {task.description && (
          <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{task.description}</p>
        )}

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1.5"><User className="w-3 h-3" /> Assignee</p>
            <p className="text-sm text-[hsl(var(--text-primary))]">{task.assignee?.name || "Unassigned"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Due Date</p>
            <p className="text-sm text-[hsl(var(--text-primary))]">{task.dueDate || "No due date"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1.5"><Clock className="w-3 h-3" /> Created</p>
            <p className="text-sm text-[hsl(var(--text-primary))]">{task.createdAt || "Just now"}</p>
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div>
            <p className="text-xs text-[hsl(var(--text-muted))] mb-2">Tags</p>
            <div className="flex gap-2 flex-wrap">
              {task.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-glass-100 text-[hsl(var(--text-secondary))] border border-glass-200">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Comments placeholder */}
        <div className="border-t border-[hsl(var(--border-subtle))] pt-6">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4" /> Comments
          </h3>
          <div className="space-y-3">
            <textarea
              placeholder="Add a comment..."
              className="glass-input w-full min-h-[80px] resize-none text-sm"
            />
            <GlassButton variant="primary" size="sm">Post Comment</GlassButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskDetail;
