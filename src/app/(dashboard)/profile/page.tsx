"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Activity, BriefcaseBusiness, Mail, Save, Sparkles, User } from "lucide-react";

type ProfileResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
    timezone: string;
  };
  workspace: { name: string };
  teamMemberships: Array<{ team: { name: string }; role: string }>;
  stats: { projects: number; tasks: Record<string, number> };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load profile");
        return response.json();
      })
      .then((data: ProfileResponse) => {
        setProfile(data);
        setName(data.user.name ?? "");
        setBio(data.user.bio ?? "");
        setTimezone(data.user.timezone ?? "Asia/Kolkata");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load profile"));
  }, []);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, timezone }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to save profile");
        return data;
      })
      .then((data: { user: ProfileResponse["user"] }) => {
        setProfile((current) => current ? { ...current, user: { ...current.user, ...data.user } } : current);
        toast.success("Profile saved");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to save profile"))
      .finally(() => setSaving(false));
  };

  const completedTasks = Object.entries(profile?.stats.tasks ?? {}).reduce((sum, [status, count]) => sum + (status === "DONE" ? count : 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="premium-card p-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-[hsl(var(--accent))] text-3xl font-extrabold text-[hsl(var(--accent-contrast))] shadow-xl shadow-[hsl(var(--accent)/0.28)]">
              {(name || profile?.user.email || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
                <Sparkles className="h-4 w-4" />
                Profile
              </div>
              <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">{name || "Your profile"}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                <Mail className="h-4 w-4" />
                {profile?.user.email ?? "Loading account..."}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.58)] px-4 py-3 text-sm font-bold text-[hsl(var(--text-secondary))]">
            {profile?.workspace.name ?? "Workspace"}
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Projects", value: String(profile?.stats.projects ?? "..."), icon: BriefcaseBusiness },
          { label: "Done tasks", value: profile ? String(completedTasks) : "...", icon: Activity },
          { label: "Teams", value: String(profile?.teamMemberships.length ?? "..."), icon: User },
        ].map((stat) => (
          <GlassCard key={stat.label} noAnimation>
            <stat.icon className="h-5 w-5 text-[hsl(var(--accent))]" />
            <p className="mt-4 text-3xl font-bold text-[hsl(var(--text-primary))]">{stat.value}</p>
            <p className="text-sm text-[hsl(var(--text-muted))]">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard noAnimation>
        <form onSubmit={saveProfile} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Account details</h2>
            <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">These values are saved to the database user record.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <GlassInput label="Full name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Chen" required />
            <GlassInput label="Timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Asia/Kolkata" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="pl-1 text-sm font-medium text-[hsl(var(--text-secondary))]">Bio</label>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} className="glass-input min-h-[120px] resize-none text-sm" placeholder="Tell your team what you are focused on..." />
          </div>
          <div className="flex justify-end">
            <GlassButton type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Save Profile</GlassButton>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}
