"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface GlassDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function GlassDropdown({ trigger, items, align = "left" }: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }
    const actionItems = items.filter((i) => !i.divider);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % actionItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + actionItems.length) % actionItems.length);
        break;
      case "Enter":
        e.preventDefault();
        actionItems[activeIndex]?.onClick?.();
        setIsOpen(false);
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" role="button" tabIndex={0} aria-expanded={isOpen}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 min-w-[180px] py-1.5 rounded-xl overflow-hidden ${align === "right" ? "right-0" : "left-0"}`}
            style={{
              background: "hsl(var(--surface-elevated))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            }}
          >
            {items.map((item, idx) =>
              item.divider ? (
                <div key={item.id} className="my-1 border-t border-[hsl(var(--border))]" />
              ) : (
                <button
                  key={item.id}
                  onClick={() => { item.onClick?.(); setIsOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    item.danger ? "text-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.1)]" : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-glass-100"
                  } ${activeIndex === idx ? "bg-glass-100" : ""}`}
                >
                  {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ChevronDown };
export default GlassDropdown;
