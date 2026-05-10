"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { User, Bell, Palette, Shield, Key, AlertTriangle, Sparkles } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("Alex Chen");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load settings");
        return response.json();
      })
      .then((data: { user: { name: string | null; bio: string | null; timezone: string } }) => {
        setName(data.user.name ?? "");
        setBio(data.user.bio ?? "");
        setTimezone(data.user.timezone ?? "Asia/Kolkata");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load settings"));
  }, []);

  const saveProfile = () => {
    setSaving(true);
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, timezone }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to save settings");
        toast.success("Settings saved");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to save settings"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.7)] p-6 shadow-xl shadow-black/5 backdrop-blur-2xl">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
          <Sparkles className="h-4 w-4" />
          Account
        </div>
        <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--text-secondary))]">Manage your profile, notification rules, security posture, and workspace preferences.</p>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex gap-2 overflow-x-auto rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.58)] p-2 lg:w-56 lg:flex-shrink-0 lg:flex-col">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-max items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all lg:w-full ${
                activeTab === tab.id
                  ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] shadow-sm"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
              }`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard noAnimation>
                <h2 className="text-lg font-heading font-semibold text-[hsl(var(--text-primary))] mb-6">Profile Settings</h2>
                <div className="flex items-center gap-5 mb-8">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-2xl font-bold text-[hsl(var(--accent-contrast))] shadow-xl shadow-[hsl(var(--accent)/0.22)]">A</div>
                  <div>
                    <GlassButton variant="outline" size="sm">Change Avatar</GlassButton>
                    <p className="text-xs text-[hsl(var(--text-muted))] mt-1.5">JPG, PNG under 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassInput label="Full Name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} />
                  <GlassInput label="Email" type="email" placeholder="Saved on your profile page" disabled />
                  <GlassInput label="Bio" placeholder="Tell us about yourself" value={bio} onChange={(event) => setBio(event.target.value)} />
                  <GlassInput label="Timezone" placeholder="UTC" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
                </div>
                <div className="mt-8 flex justify-end"><GlassButton variant="primary" loading={saving} onClick={saveProfile}>Save Changes</GlassButton></div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard noAnimation>
                <h2 className="text-lg font-heading font-semibold text-[hsl(var(--text-primary))] mb-6">Notification Preferences</h2>
                <div className="space-y-1">
                  {["Task assigned to you","Task completed","New comment on your task","Team invitation","Overdue task reminder"].map(pref => (
                    <div key={pref} className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: "hsl(var(--border-subtle))" }}>
                      <span className="text-sm text-[hsl(var(--text-secondary))] font-medium">{pref}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-10 h-[22px] bg-[hsl(var(--surface-active))] rounded-full peer peer-checked:bg-[hsl(var(--accent))] transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[hsl(var(--surface-elevated))] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[18px] after:shadow-sm" />
                      </label>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "danger" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard noAnimation className="!border-red-500/20">
                <h2 className="text-lg font-heading font-semibold text-[hsl(var(--error))] mb-2">Danger Zone</h2>
                <p className="text-sm text-[hsl(var(--text-muted))] mb-6">Irreversible actions. Please be careful.</p>
                <div className="p-5 rounded-2xl border border-[hsl(var(--error)/0.14)] bg-[hsl(var(--error)/0.06)]">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Delete Account</p><p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">Permanently delete your account and all data</p></div>
                    <GlassButton variant="danger" size="sm">Delete</GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {!["profile","notifications","danger"].includes(activeTab) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard noAnimation>
                <h2 className="text-lg font-heading font-semibold text-[hsl(var(--text-primary))] mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-sm text-[hsl(var(--text-muted))]">This settings panel is coming soon.</p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
