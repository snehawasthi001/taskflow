"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Variant = "default" | "elevated" | "interactive" | "accent" | "subtle";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: Variant;
  noPadding?: boolean;
  noAnimation?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default: "glass-card",
  elevated: "glass-card-static",
  interactive: "glass-card cursor-pointer active:scale-[0.995]",
  accent: "glass-card-static border-[hsl(var(--accent)/0.2)]",
  subtle: "rounded-[20px] p-5 border border-[hsl(var(--border-subtle))]",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = "default", noPadding = false, noAnimation = false, className = "", children, ...props }, ref) => {
    const base = variantStyles[variant];
    const padding = noPadding ? "" : "p-6";

    if (noAnimation) {
      return (
        <motion.div ref={ref} className={`${base} ${padding} ${className}`} {...props}>
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={`${base} ${padding} ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
