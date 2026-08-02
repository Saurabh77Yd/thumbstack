import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
        variant === "primary" &&
          "bg-(image:--gradient-brand) text-white shadow-[0_10px_20px_-12px_rgba(49,130,246,0.55)] hover:shadow-[0_16px_32px_-12px_rgba(123,63,242,0.6)] hover:-translate-y-0.5",
        variant === "secondary" &&
          "border border-foreground/10 bg-foreground/5 text-foreground hover:border-foreground/15 hover:bg-foreground/9",
        variant === "danger" &&
          "bg-red-600 text-white shadow-[0_10px_20px_-12px_rgba(220,38,38,0.5)] hover:bg-red-700 hover:shadow-[0_14px_28px_-12px_rgba(220,38,38,0.55)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}
