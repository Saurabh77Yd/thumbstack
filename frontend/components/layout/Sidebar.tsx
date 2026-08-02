import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function Sidebar() {
  return (
    <aside className="hidden w-48 shrink-0 flex-col gap-2 border-r border-foreground/10 p-4 text-sm text-foreground/60 md:flex">
      <Link href={ROUTES.dashboard} className="transition-colors hover:text-brand-mid">
        Dashboard
      </Link>
      <Link href={ROUTES.books} className="transition-colors hover:text-brand-mid">
        Books
      </Link>
    </aside>
  );
}
