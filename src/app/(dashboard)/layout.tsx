"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { motion } from "framer-motion";
import ColorBends from "@/components/react-bits/ColorBends";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen relative z-10 overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.16] [mask-image:radial-gradient(ellipse_at_58%_18%,black_0%,black_36%,transparent_78%)]">
          <ColorBends
            colors={["var(--bend-1)", "var(--bend-2)", "var(--bend-3)", "var(--bend-4)"]}
            rotation={90}
            speed={0.12}
            scale={1.22}
            frequency={0.86}
            warpStrength={0.65}
            mouseInfluence={0.35}
            noise={0.04}
            parallax={0.22}
            iterations={2}
            intensity={0.85}
            bandWidth={4.2}
            transparent={false}
            autoRotate={0}
          />
        </div>
        <Sidebar />
        <CommandPalette />
        <motion.div
          animate={{ marginLeft: collapsed ? 84 : 280 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex min-h-screen flex-col max-md:!ml-0"
        >
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="content-container py-6 md:py-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </motion.div>
      </div>
    </SidebarContext.Provider>
  );
}
