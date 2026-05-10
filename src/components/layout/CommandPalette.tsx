"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, CheckSquare, FolderKanban, Users, BarChart3, Settings, Plus, ArrowRight, User } from "lucide-react";
import { OPEN_COMMAND_PALETTE_EVENT } from "@/lib/ui-events";

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items: PaletteItem[] = [
    { id: "dashboard", label: "Go to Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, category: "Navigation", action: () => router.push("/") },
    { id: "tasks", label: "Go to Tasks", icon: <CheckSquare className="w-4 h-4" />, category: "Navigation", action: () => router.push("/tasks") },
    { id: "projects", label: "Go to Projects", icon: <FolderKanban className="w-4 h-4" />, category: "Navigation", action: () => router.push("/projects") },
    { id: "team", label: "Go to Team", icon: <Users className="w-4 h-4" />, category: "Navigation", action: () => router.push("/team") },
    { id: "analytics", label: "Go to Analytics", icon: <BarChart3 className="w-4 h-4" />, category: "Navigation", action: () => router.push("/analytics") },
    { id: "profile", label: "Go to Profile", icon: <User className="w-4 h-4" />, category: "Navigation", action: () => router.push("/profile") },
    { id: "settings", label: "Go to Settings", icon: <Settings className="w-4 h-4" />, category: "Navigation", action: () => router.push("/settings") },
    { id: "new-task", label: "Create New Task", description: "Add a task to a project", icon: <Plus className="w-4 h-4" />, category: "Actions", action: () => router.push("/tasks?new=true") },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen((prev) => {
        const next = !prev;
        if (next) {
          setQuery("");
          setActiveIndex(0);
        }
        return next;
      });
    }
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette);
    };
  }, [handleKeyDown, openPalette]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      filtered[activeIndex].action();
      setIsOpen(false);
    }
  };

  const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border-subtle))]">
              <Search className="w-5 h-5 text-[hsl(var(--text-muted))]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleItemKeyDown}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] outline-none"
              />
              <kbd className="px-2 py-0.5 rounded bg-glass-100 text-[10px] font-mono text-[hsl(var(--text-muted))]">ESC</kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {Object.entries(grouped).map(([category, catItems]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">{category}</div>
                  {catItems.map((item) => {
                    const globalIdx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => { item.action(); setIsOpen(false); }}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          activeIndex === globalIdx ? "bg-glass-100 text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-secondary))] hover:bg-glass-50"
                        }`}
                      >
                        {item.icon}
                        <div className="flex-1 text-left">
                          <div>{item.label}</div>
                          {item.description && <div className="text-xs text-[hsl(var(--text-muted))]">{item.description}</div>}
                        </div>
                        {activeIndex === globalIdx && <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--text-muted))]" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-[hsl(var(--text-muted))]">No results found</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
