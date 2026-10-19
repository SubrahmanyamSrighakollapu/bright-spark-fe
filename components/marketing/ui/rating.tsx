"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/marketing/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviews?: number;
  className?: string;
}

export function Rating({ value, max = 5, size = "md", showValue, reviews, className }: RatingProps) {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(value) ? "fill-amber-400 text-amber-400" :
              i < value ? "fill-amber-200 text-amber-400" :
              "fill-slate-200 text-slate-200"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn("font-semibold text-slate-900 dark:text-white", textSizes[size])}>
          {value.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className={cn("text-slate-500", textSizes[size])}>
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}
