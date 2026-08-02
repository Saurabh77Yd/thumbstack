import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-linear-to-br from-brand-start/5 via-transparent to-brand-end/5 px-4 py-12">
      {children}
    </div>
  );
}
