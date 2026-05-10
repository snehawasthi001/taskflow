import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TaskFlow | Production Task Management Platform",
  description: "Enterprise-grade task management and team collaboration with real-time boards, analytics, and delivery intelligence.",
  keywords: ["task management", "project management", "kanban", "team collaboration"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark theme-amethyst" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0d0f17" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f6fa" media="(prefers-color-scheme: light)" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              background: "hsl(var(--surface-elevated))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--text-primary))",
              borderRadius: "16px",
              fontSize: "0.875rem",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
