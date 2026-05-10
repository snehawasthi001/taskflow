"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassDropdown } from "@/components/ui/GlassDropdown";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  taskCount: number;
  completedCount: number;
  team: string;
  due: string;
  health: string;
};

const initialProjects: Project[] = [
  { id: "1", name: "Frontend Redesign", description: "Premium UI overhaul, motion language, accessibility pass, and design system polish.", color: "var(--chart-1)", taskCount: 24, completedCount: 17, team: "Design Systems", due: "May 10", health: "On track" },
  { id: "2", name: "API v2 Migration", description: "Versioned endpoints, audit trails, search, notifications, and backwards-compatible rollout.", color: "var(--chart-2)", taskCount: 18, completedCount: 8, team: "Platform", due: "May 16", health: "Watch" },
  { id: "3", name: "Mobile App", description: "React Native beta with offline board sync, push notifications, and workspace switching.", color: "var(--chart-5)", taskCount: 31, completedCount: 7, team: "Mobile", due: "May 22", health: "At risk" },
  { id: "4", name: "DevOps Pipeline", description: "Container hardening, preview environments, observability, and release automation.", color: "var(--chart-3)", taskCount: 15, completedCount: 12, team: "Infrastructure", due: "May 12", health: "Ahead" },
  { id: "5", name: "Analytics Layer", description: "Delivery metrics, capacity forecasting, workload heatmaps, and executive reporting.", color: "var(--chart-4)", taskCount: 12, completedCount: 5, team: "Data", due: "May 18", health: "On track" },
  { id: "6", name: "Security Audit", description: "RBAC verification, OAuth threat modeling, pen test fixes, and compliance evidence.", color: "var(--error)", taskCount: 8, completedCount: 3, team: "Security", due: "May 20", health: "Watch" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42 } } };

function colorValue(color: string) {
  return color.startsWith("var(") ? `hsl(${color})` : color;
}

function colorSoft(color: string) {
  return `color-mix(in srgb, ${colorValue(color)} 14%, transparent)`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState("Platform");
  const [due, setDue] = useState("2026-05-24");
  const [health, setHealth] = useState("On track");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/projects")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load projects");
        return response.json();
      })
      .then((data: { projects: Project[] }) => {
        if (isMounted) setProjects(data.projects);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load projects"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const portfolioStats = useMemo(() => {
    const totalTasks = projects.reduce((sum, project) => sum + project.taskCount, 0);
    const completed = projects.reduce((sum, project) => sum + project.completedCount, 0);
    return {
      count: projects.length,
      progress: totalTasks ? Math.round((completed / totalTasks) * 100) : 0,
    };
  }, [projects]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTeam("Platform");
    setDue("2026-05-24");
    setHealth("On track");
  };

  const createProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        description: description.trim() || "New initiative ready for planning, owners, and delivery tracking.",
        teamName: team.trim() || "Platform",
        endDate: due ? `${due}T12:00:00.000Z` : null,
        color: "#EC4899",
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create project");
        return data as { project: Project };
      })
      .then(({ project }) => {
        setProjects((current) => [project, ...current]);
        setIsCreateOpen(false);
        resetForm();
        toast.success("Project created", { description: `${project.name} is now in your portfolio.` });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to create project"));
  };

  const markOnTrack = (projectId: string) => {
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error || "Failed to update project");
        setProjects((current) => current.map((project) => (project.id === projectId ? { ...project, health: "On track" } : project)));
        toast.success("Project health updated");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to update project"));
  };

  const archiveProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error || "Failed to archive project");
        setProjects((current) => current.filter((item) => item.id !== projectId));
        if (project) toast.success("Project archived", { description: project.name });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to archive project"));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.section variants={item} className="premium-card p-6">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
              <Sparkles className="h-4 w-4" />
              Portfolio
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">Projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--text-secondary))]">
              Track strategic initiatives with visible ownership, health, deadlines, and delivery progress.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.58)] px-4 py-2 text-sm font-bold text-[hsl(var(--text-secondary))]">
              {portfolioStats.count} active - {portfolioStats.progress}% shipped
            </div>
            <GlassButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
              New Project
            </GlassButton>
          </div>
        </div>
      </motion.section>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <div className="col-span-full rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] p-8 text-sm text-[hsl(var(--text-muted))]">
            Loading projects from the database...
          </div>
        )}
        {projects.map((project) => {
          const progress = Math.round((project.completedCount / project.taskCount) * 100);
          return (
            <div key={project.id} className="group rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.22)]">
              <div className="mb-5 flex items-start justify-between">
                <div className="rounded-2xl p-3" style={{ background: colorSoft(project.color), color: colorValue(project.color) }}>
                  <FolderKanban className="h-5 w-5" />
                </div>
                <GlassDropdown
                  align="right"
                  trigger={
                    <button aria-label={`Project actions for ${project.name}`} className="rounded-full p-2 text-[hsl(var(--text-muted))] opacity-70 transition hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-primary))] group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    { id: "open", label: "Open project", icon: <ArrowUpRight className="w-4 h-4" />, onClick: () => router.push(`/projects/${project.id}`) },
                    { id: "track", label: "Mark on track", icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => markOnTrack(project.id) },
                    { id: "div", label: "", divider: true },
                    { id: "archive", label: "Archive", icon: <Archive className="w-4 h-4" />, danger: true, onClick: () => archiveProject(project.id) },
                  ]}
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">{project.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[hsl(var(--text-muted))]">{project.description}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Open ${project.name}`}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="mt-1 flex-shrink-0 rounded-full p-1 text-[hsl(var(--text-muted))] transition hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--accent))]"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--text-muted))]">{project.completedCount}/{project.taskCount} tasks</span>
                  <span className="font-bold" style={{ color: colorValue(project.color) }}>{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(var(--surface-active))]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: colorValue(project.color) }} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[hsl(var(--border-subtle))] pt-4 text-xs">
                <span className="rounded-2xl bg-[hsl(var(--surface-hover))] px-3 py-2 font-semibold text-[hsl(var(--text-secondary))]">{project.health}</span>
                <span className="flex items-center justify-center gap-1 rounded-2xl bg-[hsl(var(--surface-hover))] px-3 py-2 text-[hsl(var(--text-muted))]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {project.due}
                </span>
                <span className="flex items-center justify-center gap-1 rounded-2xl bg-[hsl(var(--surface-hover))] px-3 py-2 text-[hsl(var(--text-muted))]">
                  <Users className="h-3.5 w-3.5" />
                  {project.team.split(" ")[0]}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      <GlassModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create project" description="Add a new portfolio initiative." size="lg">
        <form onSubmit={createProject} className="space-y-4">
          <GlassInput label="Project name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Revenue intelligence launch" required />
          <div className="flex flex-col gap-1.5">
            <label className="pl-1 text-sm font-medium text-[hsl(var(--text-secondary))]">Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the outcome, scope, and ownership..." className="glass-input min-h-[110px] resize-none text-sm" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <GlassInput label="Team" value={team} onChange={(event) => setTeam(event.target.value)} placeholder="Platform" />
            <GlassInput label="Due date" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="pl-1 text-sm font-medium text-[hsl(var(--text-secondary))]">Health</label>
              <select value={health} onChange={(event) => setHealth(event.target.value)} className="glass-input text-sm">
                <option>On track</option>
                <option>Ahead</option>
                <option>Watch</option>
                <option>At risk</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" disabled={!name.trim()}>Create Project</GlassButton>
          </div>
        </form>
      </GlassModal>
    </motion.div>
  );
}
