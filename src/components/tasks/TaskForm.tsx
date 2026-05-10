"use client";

import { useState } from "react";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassModal } from "@/components/ui/GlassModal";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: string;
  onSubmit?: (data: { title: string; description: string; priority: string; status: string }) => void;
}

export function TaskForm({ isOpen, onClose, defaultStatus = "BACKLOG", onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState(defaultStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSubmit?.({ title: trimmedTitle, description: description.trim(), priority, status });
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Create New Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput label="Title" placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))] pl-1">Description</label>
          <textarea
            placeholder="Describe the task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input w-full min-h-[100px] resize-none text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))] pl-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="glass-input text-sm">
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="NONE">None</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))] pl-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input text-sm">
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="TESTING">Testing</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <GlassButton type="button" variant="ghost" onClick={onClose}>Cancel</GlassButton>
          <GlassButton type="submit" variant="primary" disabled={!title.trim()}>Create Task</GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export default TaskForm;
