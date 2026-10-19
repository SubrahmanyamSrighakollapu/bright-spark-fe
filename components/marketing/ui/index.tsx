"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/marketing/utils";

// ─── Badge ───────────────────────────────────────────────────────────────────
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-100 text-emerald-700",
        secondary: "bg-slate-100 text-slate-700",
        outline: "border border-current",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-[#E7EFD2] text-[#285C50]",
        premium: "bg-gradient-to-r from-amber-400 to-orange-400 text-white",
        glass: "glass text-slate-700",
      },
      size: {
        sm: "text-xs px-2 py-0.5 rounded-md",
        md: "text-xs px-2.5 py-1 rounded-lg",
        lg: "text-sm px-3 py-1 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass: isGlass, hover, padding = "md", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border overflow-hidden",
        isGlass ? "glass" : "bg-white dark:bg-slate-900",
        "border-slate-100 dark:border-slate-800",
        hover && "card-lift cursor-pointer",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "",
        className
      )}
      style={{ boxShadow: "var(--shadow-md)", ...props.style }}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, iconRight, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
            icon && "pl-10",
            iconRight && "pr-10",
            error && "border-red-400 focus:ring-red-400/30",
            className
          )}
          {...props}
        />
        {iconRight && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{iconRight}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shimmer rounded-xl", className)} {...props} />;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }
  return <div className={cn("h-px bg-slate-200 dark:bg-slate-700", className)} />;
}

