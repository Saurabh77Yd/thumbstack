import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ icon: Icon, title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-[0_30px_80px_-30px_rgba(11,15,31,0.35)]">
      <div className="bg-(image:--gradient-brand) px-10 py-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
          <Icon className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-white/75">{subtitle}</p>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}
