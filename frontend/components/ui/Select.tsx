import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  size?: "md" | "sm";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className, size = "md", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border border-foreground/15 bg-background text-sm outline-none transition-colors hover:border-foreground/25 focus:border-transparent focus:ring-2 focus:ring-brand-mid",
              size === "md" ? "px-3.5 py-2.5 pr-9" : "rounded-lg px-2.5 py-1.5 pr-7 text-xs",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className={cn(
              "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground/40",
              size === "md" ? "h-4 w-4" : "h-3.5 w-3.5 right-2",
            )}
          />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
