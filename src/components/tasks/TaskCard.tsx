"use client";

import { motion } from "framer-motion";
import { GlassBadge, PriorityBadge } from "@/components/ui/GlassBadge";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: string;
    tags: string[];
    assignee?: { name: string; image?: string };
    dueDate?: string;
    commentCount?: number;
    attachmentCount?: number;
  };
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.82)] p-4 shadow-lg shadow-black/5 backdrop-blur-xl transition duration-300 hover:border-white/15"
    >
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {task.tags.slice(0, 2).map((tag) => (
          <GlassBadge key={tag} variant="outline" color="var(--accent)">{tag}</GlassBadge>
        ))}
      </div>

      <h3 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-3 line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
        {task.title}
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[hsl(var(--text-muted))]">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}
          {task.commentCount !== undefined && task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3" />
              {task.commentCount}
            </span>
          )}
          {task.attachmentCount !== undefined && task.attachmentCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3 h-3" />
              {task.attachmentCount}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-[10px] text-[hsl(var(--accent-contrast))] font-medium" title={task.assignee.name}>
            {task.assignee.name.charAt(0)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskCard;
