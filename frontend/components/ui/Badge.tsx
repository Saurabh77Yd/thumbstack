import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground/70",
        className,
      )}
    >
      {children}
    </span>
  );
}
