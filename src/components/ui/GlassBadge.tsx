"use client";

import { type ReactNode } from "react";

type BadgeVariant = "status" | "priority" | "default" | "outline";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const priorityColors: Record<string, string> = {
  CRITICAL: "var(--error)",
  HIGH: "var(--warning)",
  MEDIUM: "var(--chart-4)",
  LOW: "var(--success)",
  NONE: "var(--text-muted)",
};

const statusColors: Record<string, string> = {
  BACKLOG: "var(--text-muted)",
  TODO: "var(--info)",
  IN_PROGRESS: "var(--warning)",
  IN_REVIEW: "var(--accent)",
  TESTING: "var(--chart-5)",
  DONE: "var(--success)",
};

function colorValue(color: string) {
  return color.startsWith("var(") ? `hsl(${color})` : color;
}

function colorAlpha(color: string, alpha: number) {
  return color.startsWith("var(") ? `hsl(${color} / ${alpha})` : `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
}

export function GlassBadge({ children, variant = "default", color, dot = false, size = "sm", className = "" }: GlassBadgeProps) {
  const rawColor = color || "var(--accent)";
  const resolvedColor = colorValue(rawColor);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${className}`}
      style={{
        background: colorAlpha(rawColor, 0.12),
        color: resolvedColor,
        border: variant === "outline" ? `1px solid ${colorAlpha(rawColor, 0.22)}` : "none",
      }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: resolvedColor }} />
      )}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityColors[priority] || "var(--text-muted)";
  return (
    <GlassBadge color={color} dot>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </GlassBadge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || "var(--text-muted)";
  const label = status.replace(/_/g, " ");
  return (
    <GlassBadge color={color} dot>
      {label.charAt(0) + label.slice(1).toLowerCase().replace(/_/g, " ")}
    </GlassBadge>
  );
}

export default GlassBadge;
