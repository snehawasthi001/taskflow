"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, FolderKanban, Users, BarChart3,
  Settings, Zap, Plus,
} from "lucide-react";
import { GlassTooltip } from "@/components/ui/GlassTooltip";
import { useSidebar } from "@/app/(dashboard)/layout";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r sidebar-surface max-md:hidden"
      style={{
        background: "hsl(var(--sidebar-bg))",
        borderColor: "hsl(var(--border))",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="h-[72px] flex items-center gap-3 px-5 border-b border-[hsl(var(--border-subtle))] flex-shrink-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-contrast))] shadow-lg shadow-[hsl(var(--accent)/0.24)]">
          <Zap className="w-[18px] h-[18px]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-heading font-bold text-xl tracking-tight text-[hsl(var(--text-primary))]">
                Task
              </span>
              <span className="font-heading font-bold text-xl tracking-tight text-[hsl(var(--accent))]">
                Flow
              </span>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--text-muted))]">
                Command OS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Action ─────────────────────────────────────── */}
      <div className="px-3 pt-5 pb-3 flex-shrink-0">
        <Link href="/tasks?new=true">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
              bg-[hsl(var(--accent)/0.1)]
              border border-[hsl(var(--accent)/0.18)]
              text-[hsl(var(--accent))]
              hover:bg-[hsl(var(--accent)/0.14)]
              hover:border-[hsl(var(--accent)/0.28)]
              transition-all cursor-pointer
              ${collapsed ? "justify-center" : ""}`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">New Task</span>}
          </motion.div>
        </Link>
      </div>

      {/* ── Label ────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-6 pt-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--text-muted))]">
            Navigation
          </span>
        </div>
      )}

      {/* ── Main Navigation ──────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const linkEl = (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${active
                  ? "text-[hsl(var(--text-primary))]"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
                }
                ${collapsed ? "justify-center" : ""}`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-2xl border border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.1)]"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
              {active && (
                <motion.div
                  layoutId="sidebar-accent-bar"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[hsl(var(--accent))]"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 transition-colors ${
                  active ? "" : "group-hover:text-[hsl(var(--text-primary))]"
                }`}
                style={active ? { color: "hsl(var(--accent))" } : {}}
              />
              {!collapsed && (
                <span className="relative z-10">{item.label}</span>
              )}
              {active && !collapsed && (
                <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] relative z-10" />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <GlassTooltip key={item.href} content={item.label} position="right">
                {linkEl}
              </GlassTooltip>
            );
          }
          return <div key={item.href}>{linkEl}</div>;
        })}
      </nav>

      {/* ── Bottom ───────────────────────────────────────────── */}
      <div className="p-3 space-y-1 border-t border-[hsl(var(--border-subtle))] flex-shrink-0">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${active ? "text-[hsl(var(--text-primary))] bg-[hsl(var(--surface-hover))]" : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-hover))]"}
                ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}

export default Sidebar;
