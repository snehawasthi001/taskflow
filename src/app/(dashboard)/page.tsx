"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Command,
  GitBranch,
  Layers3,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import ColorBends from "@/components/react-bits/ColorBends";
import { GlassButton } from "@/components/ui/GlassButton";
import { openCommandPalette } from "@/lib/ui-events";

const metrics = [
  { label: "Confidence", value: "94%", delta: "+8.2%", icon: Target, tone: "var(--chart-1)", detail: "Sprint delivery model" },
  { label: "Shipped", value: "248", delta: "+31", icon: CheckCircle2, tone: "var(--chart-3)", detail: "Tasks this cycle" },
  { label: "Cycle time", value: "2.1d", delta: "-18%", icon: Clock3, tone: "var(--chart-4)", detail: "Median completion" },
  { label: "Risk", value: "6", delta: "-3", icon: ShieldCheck, tone: "var(--chart-5)", detail: "Active exposures" },
];

const velocityData = [
  { day: "Mon", planned: 28, shipped: 22, focus: 71 },
  { day: "Tue", planned: 34, shipped: 31, focus: 76 },
  { day: "Wed", planned: 26, shipped: 33, focus: 83 },
  { day: "Thu", planned: 41, shipped: 36, focus: 79 },
  { day: "Fri", planned: 38, shipped: 44, focus: 88 },
  { day: "Sat", planned: 18, shipped: 16, focus: 69 },
  { day: "Sun", planned: 14, shipped: 12, focus: 64 },
];

const initiatives = [
  { name: "Design system", progress: 91, owner: "Lisa", due: "May 09", tone: "var(--chart-5)" },
  { name: "AI triage", progress: 84, owner: "Alex", due: "May 10", tone: "var(--chart-1)" },
  { name: "Infra hardening", progress: 76, owner: "Dev", due: "May 16", tone: "var(--chart-3)" },
  { name: "Mobile beta", progress: 67, owner: "Sarah", due: "May 14", tone: "var(--chart-2)" },
];

const workload = [
  { name: "Design", value: 28, tone: "var(--chart-5)" },
  { name: "Frontend", value: 34, tone: "var(--chart-1)" },
  { name: "Backend", value: 24, tone: "var(--chart-2)" },
  { name: "Ops", value: 14, tone: "var(--chart-3)" },
];

const activity = [
  { title: "Design QA approved", meta: "Experience polish", icon: CheckCircle2, tone: "var(--chart-5)" },
  { title: "OAuth replay tests passed", meta: "Security lane", icon: ShieldCheck, tone: "var(--chart-3)" },
  { title: "Interaction pass merged", meta: "Frontend redesign", icon: Sparkles, tone: "var(--chart-1)" },
  { title: "Mobile beta unblocked", meta: "Product sync", icon: Users, tone: "var(--chart-2)" },
  { title: "Queue latency resolved", meta: "Infrastructure", icon: GitBranch, tone: "var(--chart-4)" },
  { title: "Sprint notes published", meta: "Leadership brief", icon: MessageSquare, tone: "var(--accent)" },
];

const executiveSignals = [
  { label: "Forecast", value: "On track", icon: Target },
  { label: "Focus", value: "88%", icon: TrendingUp },
  { label: "Deploy", value: "18:30", icon: GitBranch },
  { label: "Owners", value: "12", icon: Users },
];

const brief = [
  { label: "Priority lane", value: "Design system", meta: "91% ready for release", icon: Sparkles },
  { label: "Next review", value: "Today 4:30 PM", meta: "7 decisions queued", icon: Clock3 },
  { label: "Team pulse", value: "Healthy", meta: "No capacity warnings", icon: Users },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.055 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } };

function cssColor(variable: string, alpha?: number) {
  return alpha === undefined ? `hsl(${variable})` : `hsl(${variable} / ${alpha})`;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.94)] px-3 py-2 text-xs text-[hsl(var(--text-primary))] shadow-2xl backdrop-blur-2xl">
      {label && <p className="mb-1 font-bold">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="relative isolate space-y-5">
      <div className="pointer-events-none absolute inset-x-[-5rem] top-[-4rem] -z-10 h-[520px] overflow-hidden rounded-[56px] opacity-[0.18] [mask-image:radial-gradient(ellipse_at_48%_8%,black_0%,black_36%,transparent_74%)]">
        <ColorBends
          colors={["var(--bend-1)", "var(--bend-2)", "var(--bend-3)", "var(--bend-4)"]}
          rotation={82}
          speed={0.1}
          scale={1.24}
          frequency={0.84}
          warpStrength={0.62}
          mouseInfluence={0.24}
          noise={0.035}
          parallax={0.16}
          iterations={1}
          intensity={0.72}
          bandWidth={3.8}
          transparent={false}
          autoRotate={0}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--surface)/0.32),hsl(var(--surface)/0.78)_52%,hsl(var(--surface)))]" />
      </div>

      <motion.section variants={item} className="premium-card p-0">
        <div className="relative z-10 grid gap-0 overflow-hidden rounded-[30px] xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="relative min-h-[360px] p-6 md:p-10">
            <ColorBends
              colors={["var(--bend-1)", "var(--bend-2)", "var(--bend-3)", "var(--bend-4)"]}
              rotation={88}
              speed={0.1}
              scale={1.25}
              frequency={0.84}
              warpStrength={0.6}
              mouseInfluence={0.2}
              noise={0.035}
              parallax={0.16}
              iterations={1}
              intensity={0.72}
              bandWidth={3.8}
              autoRotate={0}
              transparent={false}
              className="absolute inset-0 opacity-[0.16]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--surface-elevated)/0.96),hsl(var(--surface-elevated)/0.88),hsl(var(--surface-elevated)/0.78))]" />
            <div className="relative flex min-h-[280px] max-w-3xl flex-col justify-between">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.08)] px-3.5 py-1.5 text-xs font-extrabold uppercase text-[hsl(var(--accent))]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Executive workspace
                </div>
                <h1 className="text-4xl font-bold leading-[1.02] text-[hsl(var(--text-primary))] md:text-6xl">
                  Elegant control for every sprint decision.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[hsl(var(--text-secondary))]">
                  A refined command surface for delivery confidence, team capacity, project momentum, and the next best action.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <GlassButton icon={<Plus className="h-4 w-4" />} onClick={() => router.push("/tasks?new=true")}>New task</GlassButton>
                <button
                  type="button"
                  onClick={openCommandPalette}
                  className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.76)] px-5 py-2.5 text-sm font-bold text-[hsl(var(--text-primary))] shadow-sm backdrop-blur-xl transition hover:border-[hsl(var(--accent)/0.28)]"
                >
                  <Command className="h-4 w-4 text-[hsl(var(--accent))]" />
                  Command menu
                </button>
                <span className="rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.64)] px-4 py-2 text-xs font-bold text-[hsl(var(--text-muted))]">
                  Updated 2 min ago
                </span>
              </div>
            </div>
          </div>

          <div className="grid border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.48)] xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2">
              {executiveSignals.map((signal, index) => (
                <div
                  key={signal.label}
                  className={`min-h-[180px] p-6 ${index % 2 === 0 ? "border-r border-[hsl(var(--border-subtle))]" : ""} ${index < 2 ? "border-b border-[hsl(var(--border-subtle))]" : ""}`}
                >
                  <span className="icon-tile h-11 w-11">
                    <signal.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-6 text-xs font-extrabold uppercase text-[hsl(var(--text-muted))]">{signal.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-[hsl(var(--text-primary))]">{signal.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card overflow-hidden p-5">
            <div className="relative z-10 flex items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--accent)/0.09)]" style={{ color: cssColor(metric.tone) }}>
                <metric.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-[hsl(var(--success)/0.1)] px-2.5 py-1 text-xs font-extrabold text-[hsl(var(--success))]">{metric.delta}</span>
            </div>
            <div className="relative z-10 mt-7">
              <p className="text-4xl font-extrabold text-[hsl(var(--text-primary))]">{metric.value}</p>
              <p className="mt-1 text-sm font-extrabold text-[hsl(var(--text-primary))]">{metric.label}</p>
              <p className="mt-0.5 text-xs font-semibold text-[hsl(var(--text-muted))]">{metric.detail}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.section variants={item} className="premium-card p-4">
        <div className="relative z-10 grid gap-3 lg:grid-cols-3">
          {brief.map((entry) => (
            <div key={entry.label} className="group flex items-center gap-4 rounded-[24px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.56)] p-4 transition hover:border-[hsl(var(--accent)/0.22)]">
              <span className="icon-tile h-12 w-12 flex-shrink-0">
                <entry.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase text-[hsl(var(--text-muted))]">{entry.label}</p>
                <p className="mt-0.5 truncate text-lg font-extrabold text-[hsl(var(--text-primary))]">{entry.value}</p>
                <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">{entry.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.42fr_0.78fr]">
        <motion.section variants={item} className="premium-card p-5">
          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase text-[hsl(var(--accent))]">Velocity</p>
                <h2 className="mt-1 text-3xl font-bold text-[hsl(var(--text-primary))]">Plan versus shipped</h2>
              </div>
              <div className="rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.72)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--text-muted))]">
                Last 7 days
              </div>
            </div>
            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData} margin={{ left: -16, right: 8, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plannedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cssColor("var(--chart-2)")} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={cssColor("var(--chart-2)")} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="shippedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cssColor("var(--chart-1)")} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={cssColor("var(--chart-1)")} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={cssColor("var(--border-subtle)")} vertical={false} />
                  <XAxis dataKey="day" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="planned" stroke={cssColor("var(--chart-2)")} strokeWidth={2} fill="url(#plannedFill)" />
                  <Area type="monotone" dataKey="shipped" stroke={cssColor("var(--chart-1)")} strokeWidth={3} fill="url(#shippedFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="premium-card p-5">
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-[hsl(var(--accent))]">Workload</p>
                <h2 className="mt-1 text-3xl font-bold text-[hsl(var(--text-primary))]">Allocation</h2>
              </div>
              <Layers3 className="h-5 w-5 text-[hsl(var(--text-muted))]" />
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workload} dataKey="value" innerRadius={64} outerRadius={96} paddingAngle={5} stroke="none">
                    {workload.map((entry) => (
                      <Cell key={entry.name} fill={cssColor(entry.tone)} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {workload.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.62)] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--text-secondary))]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: cssColor(entry.tone) }} />
                    {entry.name}
                  </span>
                  <span className="text-sm font-extrabold text-[hsl(var(--text-primary))]">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section variants={item} className="premium-card h-full p-5">
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-[hsl(var(--accent))]">Roadmap</p>
                <h2 className="mt-1 text-3xl font-bold text-[hsl(var(--text-primary))]">Key initiatives</h2>
              </div>
              <button className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--accent))]">
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {initiatives.map((initiative) => (
                <div key={initiative.name} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.58)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-[hsl(var(--text-primary))]">{initiative.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-[hsl(var(--text-muted))]">{initiative.owner} owns delivery by {initiative.due}</p>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: cssColor(initiative.tone) }}>{initiative.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(var(--surface-active))]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${initiative.progress}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: cssColor(initiative.tone) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[hsl(var(--border-subtle))] pt-5">
              {[
                { label: "Scope", value: "82%" },
                { label: "Spend", value: "68%" },
                { label: "Risk", value: "Low" },
              ].map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.52)] p-3">
                  <p className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-muted))]">{entry.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-[hsl(var(--text-primary))]">{entry.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="premium-card flex h-full min-h-[620px] flex-col p-5">
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-[hsl(var(--accent))]">Signal</p>
                <h2 className="mt-1 text-3xl font-bold text-[hsl(var(--text-primary))]">Live activity</h2>
              </div>
              <MessageSquare className="h-5 w-5 text-[hsl(var(--text-muted))]" />
            </div>
            <div className="mb-5 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ left: -16, right: 4, top: 6, bottom: 0 }}>
                  <CartesianGrid stroke={cssColor("var(--border-subtle)")} vertical={false} />
                  <XAxis dataKey="day" stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                  <YAxis stroke={cssColor("var(--text-muted)")} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="focus" radius={[9, 9, 0, 0]} fill={cssColor("var(--chart-4)")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid flex-1 content-start gap-3 sm:grid-cols-2">
              {activity.map((event) => (
                <div key={event.title} className="flex items-center gap-3 rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.58)] p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--accent)/0.1)]" style={{ color: cssColor(event.tone) }}>
                    <event.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-[hsl(var(--text-primary))]">{event.title}</p>
                    <p className="text-xs font-medium text-[hsl(var(--text-muted))]">{event.meta}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[hsl(var(--border-subtle))] pt-5">
              {[
                { label: "SLA", value: "99.9%" },
                { label: "Replies", value: "42" },
                { label: "Health", value: "A+" },
              ].map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.52)] p-3">
                  <p className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-muted))]">{entry.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-[hsl(var(--text-primary))]">{entry.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
