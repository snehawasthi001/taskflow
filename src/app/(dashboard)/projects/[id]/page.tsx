"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { ArrowLeft, Settings } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects"><GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</GlassButton></Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[hsl(var(--text-primary))]">Project {params.id}</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))]">Project task board</p>
          </div>
        </div>
        <GlassButton variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>Settings</GlassButton>
      </div>
      <KanbanBoard />
    </div>
  );
}
