"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Moon, Palette, Sun } from "lucide-react";

type Mode = "dark" | "light";
type Accent = "amethyst" | "emerald" | "sapphire" | "rose";

const accents: Array<{ id: Accent; label: string }> = [
  { id: "amethyst", label: "Amethyst" },
  { id: "emerald", label: "Emerald" },
  { id: "sapphire", label: "Sapphire" },
  { id: "rose", label: "Rose" },
];

function readMode(): Mode {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("taskflow-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readAccent(): Accent {
  if (typeof window === "undefined") return "amethyst";
  const saved = localStorage.getItem("taskflow-accent");
  return accents.some((accent) => accent.id === saved) ? (saved as Accent) : "amethyst";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(readMode);
  const [accent, setAccent] = useState<Accent>(readAccent);
  const [open, setOpen] = useState(false);
  const accentClassNames = useMemo(() => accents.map((item) => `theme-${item.id}`).join(" "), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", mode === "light");
    root.classList.toggle("dark", mode === "dark");
    root.classList.remove(...accentClassNames.split(" "));
    root.classList.add(`theme-${accent}`);
    localStorage.setItem("taskflow-theme", mode);
    localStorage.setItem("taskflow-accent", accent);
  }, [accent, accentClassNames, mode]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.72)] px-2.5 text-[hsl(var(--text-secondary))] shadow-sm backdrop-blur-xl transition hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--text-primary))]"
        aria-label="Open theme selector"
        type="button"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
          <Palette className="h-3.5 w-3.5" />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={{ opacity: 0, rotate: -35, scale: 0.86 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 35, scale: 0.86 }}
            transition={{ duration: 0.18 }}
            className="hidden sm:grid"
          >
            {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-64 rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.92)] p-3 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-3 grid grid-cols-2 rounded-2xl bg-[hsl(var(--surface-hover))] p-1">
              {(["dark", "light"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                    mode === item
                      ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-primary))] shadow-sm"
                      : "text-[hsl(var(--text-muted))]"
                  }`}
                >
                  {item === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {accents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAccent(item.id)}
                  className={`theme-${item.id} flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-[hsl(var(--surface-hover))]`}
                >
                  <span className="h-5 w-5 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_0_4px_hsl(var(--accent)/0.12)]" />
                  <span className="flex-1 text-sm font-semibold text-[hsl(var(--text-secondary))]">{item.label}</span>
                  {accent === item.id && <Check className="h-4 w-4 text-[hsl(var(--accent))]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeToggle;
