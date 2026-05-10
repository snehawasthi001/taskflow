"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Github, Sun, Moon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("taskflow-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("taskflow-theme", theme);
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const n = theme === "dark" ? "light" : "dark";
    setTheme(n);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await fetch("/api/auth/callback/credentials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (!r.ok) throw new Error(); window.location.href = "/";
    } catch { toast.error("Invalid email or password"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative z-10">
      {/* Left — Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center" style={{ background: "hsl(var(--surface))" }}>
        <div className="absolute inset-0">
          <motion.div animate={{ x: [0,50,0], y: [0,-30,0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsl(var(--accent)/0.35), transparent)" }} />
          <motion.div animate={{ x: [0,-40,0], y: [0,40,0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent)" }} />
        </div>
        <div className="relative z-10 space-y-5 max-w-md px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard variant="elevated"><div className="flex items-center gap-3 mb-4"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Zap className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm text-[hsl(var(--text-primary))]">Sprint Velocity</h3><p className="text-xs text-emerald-400 font-medium">+23% this week</p></div></div><div className="flex gap-1.5 h-10 items-end">{[40,65,45,80,55,90,70].map((h,i) => (<motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.4+i*0.08 }} className="flex-1 rounded-md bg-gradient-to-t from-indigo-500/50 to-purple-500/30" />))}</div></GlassCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard variant="elevated"><p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed italic">&ldquo;TaskFlow transformed how our team manages sprints. The real-time Kanban is a game changer.&rdquo;</p><div className="flex items-center gap-2.5 mt-4"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">S</div><div><p className="text-xs font-semibold text-[hsl(var(--text-primary))]">Sarah Kim</p><p className="text-[11px] text-[hsl(var(--text-muted))]">Engineering Lead</p></div></div></GlassCard>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-center gap-3 pt-2">
            {["12k+ Teams","99.9% Uptime","SOC 2"].map(b => (<span key={b} className="px-3 py-1.5 rounded-full text-[11px] font-semibold border" style={{ background:"hsl(var(--surface-hover))", borderColor:"hsl(var(--border-subtle))", color:"hsl(var(--text-secondary))" }}>{b}</span>))}
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative" style={{ background: "hsl(var(--surface-elevated))" }}>
        <button onClick={toggleTheme} className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[hsl(var(--surface-hover))] text-[hsl(var(--text-muted))]">{theme==="dark"?<Sun className="w-[18px] h-[18px]"/>:<Moon className="w-[18px] h-[18px]"/>}</button>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[380px]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"><Zap className="w-5 h-5 text-white" /></div>
            <div><span className="font-heading font-bold text-xl text-[hsl(var(--text-primary))]">Task</span><span className="font-heading font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Flow</span></div>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[hsl(var(--text-primary))] mb-1.5">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Sign in to continue to your workspace</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-[hsl(var(--surface-hover))]" style={{ borderColor:"hsl(var(--border))", color:"hsl(var(--text-secondary))" }}><svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Google</button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-[hsl(var(--surface-hover))]" style={{ borderColor:"hsl(var(--border))", color:"hsl(var(--text-secondary))" }}><Github className="w-4 h-4"/>GitHub</button>
          </div>
          <div className="flex items-center gap-3 mb-6"><div className="flex-1 h-px" style={{ background:"hsl(var(--border))" }}/><span className="text-xs text-[hsl(var(--text-muted))]">or</span><div className="flex-1 h-px" style={{ background:"hsl(var(--border))" }}/></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} icon={<Mail className="w-4 h-4"/>} required />
            <GlassInput label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} icon={<Lock className="w-4 h-4"/>} required />
            <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-[hsl(var(--accent))]"/>Remember me</label><a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Forgot?</a></div>
            <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full !mt-6" icon={<ArrowRight className="w-4 h-4"/>} iconPosition="right">Sign In</GlassButton>
          </form>
          <p className="text-sm text-center text-[hsl(var(--text-muted))] mt-8">Don&apos;t have an account?{" "}<Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">Create one</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
