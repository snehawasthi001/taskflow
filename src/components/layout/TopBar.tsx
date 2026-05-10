"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Command, Menu, Search, Sparkles, UserPlus, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { GlassDropdown } from "@/components/ui/GlassDropdown";
import { LogOut, User, Settings } from "lucide-react";
import { useSidebar } from "@/app/(dashboard)/layout";
import { openCommandPalette, REFRESH_NOTIFICATIONS_EVENT } from "@/lib/ui-events";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
};

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/projects": "Projects",
  "/team": "Team",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load notifications");
        return response.json();
      })
      .then((data: { notifications: NotificationItem[]; unreadCount: number }) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifications();
    window.addEventListener(REFRESH_NOTIFICATIONS_EVENT, loadNotifications);
    return () => window.removeEventListener(REFRESH_NOTIFICATIONS_EVENT, loadNotifications);
  }, [loadNotifications]);

  const notificationItems = useMemo(() => {
    if (notifications.length === 0) {
      return [{ id: "empty", label: "No notifications yet", icon: <Bell className="w-4 h-4" />, onClick: () => {} }];
    }

    return [
      ...notifications.map((notification) => ({
        id: notification.id,
        label: `${notification.title}: ${notification.message}`,
        icon: notification.title.toLowerCase().includes("invite") ? <UserPlus className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />,
        onClick: () => {
          fetch("/api/notifications", { method: "PATCH" }).then(loadNotifications).catch(() => {});
          if (notification.link) router.push(notification.link);
        },
      })),
      { id: "mark-read", label: "Mark all read", icon: <Bell className="w-4 h-4" />, onClick: () => fetch("/api/notifications", { method: "PATCH" }).then(loadNotifications).catch(() => {}) },
    ];
  }, [loadNotifications, notifications, router]);

  const getBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["Dashboard"];
    return segments.map((s) => {
      const mapped = breadcrumbMap[`/${s}`];
      return mapped || s.charAt(0).toUpperCase() + s.slice(1);
    });
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header
      className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b px-4 topbar-surface md:px-6"
      style={{
        background: "hsl(var(--surface) / 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "hsl(var(--border-subtle))",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-hover)/0.72)] text-[hsl(var(--text-secondary))] shadow-sm backdrop-blur-xl transition hover:border-[hsl(var(--accent)/0.24)] hover:text-[hsl(var(--accent))]"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-contrast))] shadow-lg shadow-[hsl(var(--accent)/0.22)] md:hidden">
          <Zap className="h-5 w-5" />
        </div>
      <div className="hidden items-center gap-2 md:flex">
        {breadcrumb.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[hsl(var(--text-muted))] text-xs">/</span>
            )}
            <span
              className={
                i === breadcrumb.length - 1
                  ? "text-sm font-semibold text-[hsl(var(--text-primary))]"
                  : "text-sm text-[hsl(var(--text-muted))]"
              }
            >
              {item}
            </span>
          </div>
        ))}
      </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-all hover:border-[hsl(var(--border-hover))]"
          style={{
            background: "hsl(var(--surface-hover))",
            borderColor: "hsl(var(--border-subtle))",
            color: "hsl(var(--text-muted))",
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search workspace</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-mono"
            style={{ background: "hsl(var(--surface-active))" }}
          >
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        <GlassDropdown
          align="right"
          trigger={
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[hsl(var(--text-secondary))] transition-all hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-primary))]"
              aria-label="Open notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[hsl(var(--error))] px-1 text-[10px] font-extrabold text-white ring-2 ring-[hsl(var(--surface))]">
                  {unreadCount}
                </span>
              )}
            </button>
          }
          items={notificationItems}
        />

        <ThemeToggle />

        <div className="mx-1 hidden h-6 w-px sm:block" style={{ background: "hsl(var(--border-subtle))" }} />

        <GlassDropdown
          align="right"
          trigger={
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[hsl(var(--accent))] text-sm font-semibold text-[hsl(var(--accent-contrast))] shadow-md shadow-[hsl(var(--accent)/0.2)] transition-shadow hover:shadow-lg hover:shadow-[hsl(var(--accent)/0.28)]">
              A
            </div>
          }
          items={[
            { id: "profile", label: "Profile", icon: <User className="w-4 h-4" />, onClick: () => router.push("/profile") },
            { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" />, onClick: () => router.push("/settings") },
            { id: "div", label: "", divider: true },
            { id: "logout", label: "Sign Out", icon: <LogOut className="w-4 h-4" />, danger: true, onClick: () => { toast.success("Signed out"); router.push("/login"); } },
          ]}
        />
      </div>
    </header>
  );
}

export default TopBar;
