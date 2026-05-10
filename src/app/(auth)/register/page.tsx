"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, Sun, Moon } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || "Registration failed"); }
      toast.success("Account created! Redirecting...");
      window.location.href = "/login";
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Registration failed"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative z-10">
      {/* Left — Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center" style={{ background: "hsl(var(--surface))" }}>
        <div className="absolute inset-0">
          <motion.div animate={{ x: [0,-50,0], y: [0,30,0] }} transition={{ duration: 11, repeat: Infinity }} className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-25" style={{ background: "radial-gradient(circle, hsl(var(--accent)/0.35), transparent)" }} />
          <motion.div animate={{ x: [0,40,0], y: [0,-40,0] }} transition={{ duration: 13, repeat: Infinity }} className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3), transparent)" }} />
        </div>
        <div className="relative z-10 text-center max-w-md px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-heading font-bold text-[hsl(var(--text-primary))] mb-4 leading-tight">Ship faster,<br/>together</h2>
            <p className="text-[hsl(var(--text-secondary))] text-sm leading-relaxed">TaskFlow brings your team&apos;s work into one shared space. Real-time Kanban boards, instant notifications, and powerful analytics.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex justify-center gap-3">
            {["12k+ Teams", "99.9% Uptime", "SOC 2"].map(b => (<span key={b} className="px-3 py-1.5 rounded-full text-[11px] font-semibold border" style={{ background:"hsl(var(--surface-hover))", borderColor:"hsl(var(--border-subtle))", color:"hsl(var(--text-secondary))" }}>{b}</span>))}
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
          <h1 className="text-2xl font-heading font-bold text-[hsl(var(--text-primary))] mb-1.5">Create your account</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Start managing your projects in minutes</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput label="Full Name" type="text" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} icon={<User className="w-4 h-4"/>} required />
            <GlassInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} icon={<Mail className="w-4 h-4"/>} required />
            <GlassInput label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} icon={<Lock className="w-4 h-4"/>} hint="Min 8 chars with uppercase, lowercase, and number" required />
            <GlassInput label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4"/>} required />
            <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full !mt-6" icon={<ArrowRight className="w-4 h-4"/>} iconPosition="right">Create Account</GlassButton>
          </form>
          <p className="text-sm text-center text-[hsl(var(--text-muted))] mt-8">Already have an account?{" "}<Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
