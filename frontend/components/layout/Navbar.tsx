"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.books, label: "Books" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-linear-to-r from-brand-start/4 via-background/90 to-brand-end/4 shadow-[0_1px_20px_-6px_rgba(11,15,31,0.08)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(image:--gradient-brand)">
            <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="bg-(image:--gradient-brand) bg-clip-text text-sm font-semibold text-transparent">
            Book Manager
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-mid/10 text-brand-mid"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="ml-2 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Logout
            </button>
          )}
        </nav>
      </div>
      <div className="h-px w-full bg-(image:--gradient-brand) opacity-20" />
    </header>
  );
}
