"use client";

import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

export default function TaskDetailPage() {
  const params = useParams();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tasks"><GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</GlassButton></Link>
      </div>
      <GlassCard noAnimation>
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status="IN_PROGRESS" />
          <PriorityBadge priority="HIGH" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[hsl(var(--text-primary))] mb-4">Task #{params.id}</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">Detailed task view with full context, comments, attachments, and activity timeline.</p>
        <div className="mt-6"><GlassButton variant="primary" icon={<Edit3 className="w-4 h-4" />}>Edit Task</GlassButton></div>
      </GlassCard>
    </div>
  );
}
