"use client";

// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — GlassButton Component
//  5 variants · 3 sizes · Loading state · Shimmer hover
// ═══════════════════════════════════════════════════════════════

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "ghost" | "outline" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger: "btn-danger",
  accent:
    "btn-primary",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3 text-base gap-2.5",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileTap={{ scale: 0.97 }}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          font-medium select-none
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
        disabled={isDisabled}
        {...(props as Record<string, unknown>)}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
export default GlassButton;
