"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, icon, iconPosition = "left", className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[hsl(var(--text-secondary))] pl-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`glass-input w-full ${icon && iconPosition === "left" ? "pl-10" : ""} ${icon && iconPosition === "right" ? "pr-10" : ""} ${error ? "border-red-500/50 focus:border-red-500" : ""} ${className}`}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">{icon}</div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="pl-1 text-xs text-[hsl(var(--error))]">
              {error}
            </motion.p>
          )}
          {!error && hint && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[hsl(var(--text-muted))] pl-1">
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
export default GlassInput;
