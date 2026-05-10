"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, BrainCircuit, Clock3, Gauge, Sparkles, Target, TrendingUp, Users } from "lucide-react";

type Range = "Sprint" | "Month" | "Custom";

const rangeData: Record<Range, {
  flow: Array<{ period: string; throughput: number; predictability: number; quality: number }>;
  cycle: Array<{ stage: string; hours: number }>;
  team: Array<{ name: string; focus: number; load: number }>;
  metrics: Array<{ label: string; value: string; change: string; icon: typeof Gauge; color: string }>;
}> = {
  Sprint: {
    flow: [
      { period: "S1", throughput: 46, predictability: 72, quality: 81 },
      { period: "S2", throughput: 52, predictability: 76, quality: 84 },
      { period: "S3", throughput: 49, predictability: 74, quality: 83 },
      { period: "S4", throughput: 61, predictability: 81, quality: 88 },
      { period: "S5", throughput: 58, predictability: 86, quality: 91 },
      { period: "S6", throughput: 68, predictability: 89, quality: 93 },
    ],
    cycle: [
      { stage: "Backlog", hours: 12 },
      { stage: "Design", hours: 18 },
      { stage: "Build", hours: 42 },
      { stage: "Review", hours: 16 },
      { stage: "QA", hours: 11 },
      { stage: "Ship", hours: 5 },
    ],
    team: [
      { name: "Alex", focus: 92, load: 78 },
      { name: "Sarah", focus: 84, load: 69 },
      { name: "Mike", focus: 76, load: 88 },
      { name: "Lisa", focus: 89, load: 72 },
      { name: "Dev", focus: 81, load: 64 },
    ],
    metrics: [
      { label: "Predictability", value: "89%", change: "+13%", icon: Gauge, color: "var(--chart-1)" },
      { label: "Avg cycle", value: "2.1d", change: "-0.6d", icon: Clock3, color: "var(--chart-2)" },
      { label: "Goal confidence", value: "92%", change: "+9%", icon: Target, color: "var(--chart-3)" },
      { label: "Decision latency", value: "4h", change: "-31%", icon: BrainCircuit, color: "var(--chart-5)" },
    ],
  },
  Month: {
    flow: [
      { period: "W1", throughput: 182, predictability: 76, quality: 83 },
      { period: "W2", throughput: 206, predictability: 80, quality: 86 },
      { period: "W3", throughput: 228, predictability: 84, quality: 88 },
      { period: "W4", throughput: 241, predictability: 87, quality: 90 },
    ],
    cycle: [
      { stage: "Backlog", hours: 44 },
      { stage: "Design", hours: 61 },
      { stage: "Build", hours: 138 },
      { stage: "Review", hours: 52 },
      { stage: "QA", hours: 37 },
      { stage: "Ship", hours: 18 },
    ],
    team: [
      { name: "Alex", focus: 88, load: 80 },
      { name: "Sarah", focus: 82, load: 73 },
      { name: "Mike", focus: 79, load: 84 },
      { name: "Lisa", focus: 91, load: 70 },
      { name: "Dev", focus: 85, load: 68 },
    ],
    metrics: [
      { label: "Predictability", value: "87%", change: "+8%", icon: Gauge, color: "var(--chart-1)" },
      { label: "Avg cycle", value: "2.6d", change: "-0.2d", icon: Clock3, color: "var(--chart-2)" },
      { label: "Goal confidence", value: "90%", change: "+6%", icon: Target, color: "var(--chart-3)" },
      { label: "Decision latency", value: "5h", change: "-18%", icon: BrainCircuit, color: "var(--chart-5)" },
    ],
  },
  Custom: {
    flow: [
      { period: "May 1", throughput: 32, predictability: 70, quality: 78 },
      { period: "May 3", throughput: 41, predictability: 74, quality: 80 },
      { period: "May 5", throughput: 47, predictability: 79, quality: 84 },
      { period: "May 7", throughput: 53, predictability: 82, quality: 89 },
      { period: "May 9", throughput: 59, predictability: 86, quality: 92 },
    ],
    cycle: [
      { stage: "Backlog", hours: 8 },
      { stage: "Design", hours: 13 },
      { stage: "Build", hours: 31 },
      { stage: "Review", hours: 10 },
      { stage: "QA", hours: 9 },
      { stage: "Ship", hours: 4 },
    ],
    team: [
      { name: "Alex", focus: 94, load: 74 },
      { name: "Sarah", focus: 87, load: 66 },
      { name: "Mike", focus: 81, load: 82 },
      { name: "Lisa", focus: 93, load: 69 },
      { name: "Dev", focus: 84, load: 61 },
    ],
    metrics: [
      { label: "Predictability", value: "86%", change: "+5%", icon: Gauge, color: "var(--chart-1)" },
      { label: "Avg cycle", value: "1.9d", change: "-0.4d", icon: Clock3, color: "var(--chart-2)" },
      { label: "Goal confidence", value: "88%", change: "+4%", icon: Target, color: "var(--chart-3)" },
      { label: "Decision latency", value: "3h", change: "-22%", icon: BrainCircuit, color: "var(--chart-5)" },
    ],
  },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42 } } };

function cssColor(variable: string, alpha?: number) {
  return alpha === undefined ? `hsl(${variable})` : `hsl(${variable} / ${alpha})`;
}

function TooltipCard({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.94)] px-3 py-2 text-xs text-[hsl(var(--text-primary))] shadow-2xl backdrop-blur-xl">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("Sprint");
  const [customStart, setCustomStart] = useState("2026-05-01");
  const [customEnd, setCustomEnd] = useState("2026-05-09");
  const activeData = useMemo(() => rangeData[range], [range]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
            <Sparkles className="h-4 w-4" />
            Intelligence
          </div>
          <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--text-secondary))]">
            Delivery intelligence for trend spotting, planning confidence, and team capacity decisions.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover))] p-1">
          {(["Sprint", "Month", "Custom"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setRange(label)}
              aria-pressed={range === label}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${range === label ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] shadow-sm" : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"}`}
            >
              {label}
            </button>
          ))}
          </div>
          {range === "Custom" && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-end gap-2">
              <input aria-label="Custom start date" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="glass-input w-auto text-xs" />
              <input aria-label="Custom end date" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="glass-input w-auto text-xs" />
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {activeData.metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl p-3" style={{ background: cssColor(metric.color, 0.12), color: cssColor(metric.color) }}>
                <metric.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-[hsl(var(--success)/0.1)] px-2.5 py-1 text-xs font-bold text-[hsl(var(--success))]">{metric.change}</span>
            </div>
            <p className="mt-5 text-3xl font-bold text-[hsl(var(--text-primary))]">{metric.value}</p>
            <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">{metric.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.section variants={item} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.7)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-[hsl(var(--accent))]">Flow model</p>
              <h2 className="mt-1 text-2xl font-bold text-[hsl(var(--text-primary))]">Throughput, quality, predictability</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-[hsl(var(--text-muted))]" />
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData.flow} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="qualityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cssColor("var(--chart-3)")} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={cssColor("var(--chart-3)")} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={cssColor("var(--border-subtle)")} vertical={false} />
                <XAxis dataKey="period" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                <YAxis stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipCard />} />
                <Area type="monotone" dataKey="quality" stroke={cssColor("var(--chart-3)")} strokeWidth={3} fill="url(#qualityFill)" />
                <Line type="monotone" dataKey="predictability" stroke={cssColor("var(--chart-1)")} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="throughput" stroke={cssColor("var(--chart-2)")} strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section variants={item} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.7)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-[hsl(var(--accent))]">Cycle time</p>
              <h2 className="mt-1 text-2xl font-bold text-[hsl(var(--text-primary))]">Stage pressure</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-[hsl(var(--text-muted))]" />
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.cycle} layout="vertical" margin={{ left: 18, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid stroke={cssColor("var(--border-subtle)")} horizontal={false} />
                <XAxis type="number" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<TooltipCard />} />
                <Bar dataKey="hours" fill={cssColor("var(--chart-5)")} radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <motion.section variants={item} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.7)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[hsl(var(--accent))]">Capacity</p>
            <h2 className="mt-1 text-2xl font-bold text-[hsl(var(--text-primary))]">Focus versus load</h2>
          </div>
          <Users className="h-5 w-5 text-[hsl(var(--text-muted))]" />
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData.team} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
              <CartesianGrid stroke={cssColor("var(--border-subtle)")} vertical={false} />
              <XAxis dataKey="name" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
              <YAxis stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
              <Tooltip content={<TooltipCard />} />
              <Line type="monotone" dataKey="focus" stroke={cssColor("var(--chart-1)")} strokeWidth={3} />
              <Line type="monotone" dataKey="load" stroke={cssColor("var(--chart-4)")} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </motion.div>
  );
}
