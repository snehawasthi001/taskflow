"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { refreshNotifications } from "@/lib/ui-events";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassDropdown } from "@/components/ui/GlassDropdown";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import { Activity, CheckCircle2, Mail, MessageSquare, MoreHorizontal, Send, ShieldCheck, Sparkles, Trash2, UserPlus } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  avatar: string;
  status: "online" | "away" | "offline";
  tasksCompleted: number;
  focus: string;
  teamId?: string;
};

type Team = { id: string; name: string };

const roleColors: Record<string, string> = { OWNER: "var(--chart-5)", ADMIN: "var(--chart-4)", MEMBER: "var(--accent)", VIEWER: "var(--text-muted)" };
const statusColors: Record<string, string> = { online: "hsl(var(--success))", away: "hsl(var(--warning))", offline: "hsl(var(--text-muted))" };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42 } } };

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [focus, setFocus] = useState("Product");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/team")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load team");
        return response.json();
      })
      .then((data: { members: TeamMember[]; teams: Team[] }) => {
        if (!isMounted) return;
        setMembers(data.members);
        setTeams(data.teams);
        setFocus(data.teams[0]?.name ?? "Product");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load team"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      members: members.length,
      online: members.filter((member) => member.status === "online").length,
      completed: members.reduce((sum, member) => sum + member.tasksCompleted, 0),
    };
  }, [members]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("MEMBER");
    setFocus(teams[0]?.name ?? "Product");
  };

  const openInviteModal = () => {
    setInviteSuccess(null);
    setIsInviteOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteOpen(false);
    setInviteSuccess(null);
  };

  const inviteMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviting(true);
    fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, focus }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to invite member");
        return data as { member: TeamMember };
      })
      .then(({ member }) => {
        setMembers((current) => [member, ...current.filter((item) => item.id !== member.id)]);
        setInviteSuccess({ name: member.name, email: member.email });
        resetForm();
        refreshNotifications();
        toast.success("Invitation successfully sent", { description: `${member.email} has a workspace notification.` });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to invite member"))
      .finally(() => setInviting(false));
  };

  const makeAdmin = (memberId: string) => {
    fetch(`/api/team/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN" }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error || "Failed to update role");
        setMembers((current) => current.map((member) => (member.id === memberId ? { ...member, role: "ADMIN" } : member)));
        toast.success("Role updated", { description: "Member promoted to admin." });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to update role"));
  };

  const removeMember = (memberId: string) => {
    const member = members.find((item) => item.id === memberId);
    fetch(`/api/team/${memberId}`, { method: "DELETE" })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error || "Failed to remove member");
        setMembers((current) => current.filter((item) => item.id !== memberId));
        if (member) toast.success("Member removed", { description: member.name });
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to remove member"));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.section variants={item} className="premium-card p-6">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[hsl(var(--accent))]">
              <Sparkles className="h-4 w-4" />
              People
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--text-primary))]">Team</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--text-secondary))]">
              Manage roles, availability, ownership, and contribution signals without leaving the workspace.
            </p>
          </div>
          <GlassButton variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={openInviteModal}>
            Invite Member
          </GlassButton>
        </div>
      </motion.section>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Members", value: loading ? "..." : String(stats.members), icon: UserPlus, color: "hsl(var(--accent))" },
          { label: "Online now", value: loading ? "..." : String(stats.online), icon: Activity, color: "hsl(var(--success))" },
          { label: "Tasks completed", value: loading ? "..." : String(stats.completed), icon: MessageSquare, color: "hsl(var(--chart-5))" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl">
            <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            <p className="mt-4 text-3xl font-bold text-[hsl(var(--text-primary))]">{stat.value}</p>
            <p className="text-sm text-[hsl(var(--text-muted))]">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="group rounded-3xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-elevated)/0.72)] p-5 shadow-xl shadow-black/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.22)]">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-lg font-bold text-[hsl(var(--accent-contrast))] shadow-lg shadow-[hsl(var(--accent)/0.24)]">
                    {member.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[hsl(var(--surface-elevated))]" style={{ background: statusColors[member.status] }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{member.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--text-muted))]">
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </p>
                </div>
              </div>
              <GlassDropdown
                align="right"
                trigger={
                  <button aria-label={`Actions for ${member.name}`} className="rounded-full p-2 text-[hsl(var(--text-muted))] transition hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-primary))]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
                items={[
                  { id: "admin", label: "Make admin", icon: <ShieldCheck className="w-4 h-4" />, onClick: () => makeAdmin(member.id) },
                  { id: "mail", label: "Email member", icon: <Mail className="w-4 h-4" />, onClick: () => { window.location.href = `mailto:${member.email}`; } },
                  { id: "div", label: "", divider: true },
                  { id: "remove", label: "Remove member", icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => removeMember(member.id) },
                ]}
              />
            </div>
            <div className="flex items-center justify-between border-t border-[hsl(var(--border-subtle))] pt-4">
              <GlassBadge color={roleColors[member.role]} dot size="sm">{member.role}</GlassBadge>
              <span className="text-xs font-semibold text-[hsl(var(--text-muted))]">{member.focus}</span>
              <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{member.tasksCompleted} done</span>
            </div>
          </div>
        ))}
      </motion.div>

      <GlassModal isOpen={isInviteOpen} onClose={closeInviteModal} title="Invite member" description="Create a user record and send a workspace notification." size="lg">
        {inviteSuccess ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-[hsl(var(--success)/0.24)] bg-[hsl(var(--success)/0.08)] p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">Invitation successfully sent</h3>
                  <p className="mt-2 text-sm leading-6 text-[hsl(var(--text-secondary))]">
                    {inviteSuccess.name} was added to the workspace and a notification was sent to {inviteSuccess.email}.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <GlassButton type="button" variant="ghost" onClick={() => { setInviteSuccess(null); }}>
                Invite another
              </GlassButton>
              <GlassButton type="button" variant="primary" onClick={closeInviteModal}>
                Done
              </GlassButton>
            </div>
          </div>
        ) : (
          <form onSubmit={inviteMember} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <GlassInput label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Shah" required />
              <GlassInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="maya@company.com" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="pl-1 text-sm font-medium text-[hsl(var(--text-secondary))]">Role</label>
                <select value={role} onChange={(event) => setRole(event.target.value as "ADMIN" | "MEMBER" | "VIEWER")} className="glass-input text-sm">
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="pl-1 text-sm font-medium text-[hsl(var(--text-secondary))]">Team / focus</label>
                <select value={focus} onChange={(event) => setFocus(event.target.value)} className="glass-input text-sm">
                  {teams.map((team) => <option key={team.id} value={team.name}>{team.name}</option>)}
                  <option value="Product">Product</option>
                  <option value="QA">QA</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="ghost" onClick={closeInviteModal}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={inviting} disabled={!name.trim() || !email.trim()} icon={<Send className="h-4 w-4" />}>
                Invite Member
              </GlassButton>
            </div>
          </form>
        )}
      </GlassModal>
    </motion.div>
  );
}
