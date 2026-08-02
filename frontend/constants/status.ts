import { BookMarked, BookOpen, CheckCircle2, type LucideIcon } from "lucide-react";
import type { BookStatus } from "@/types/book";

export const STATUS_CONFIG: Record<BookStatus, { label: string; icon: LucideIcon }> = {
  want_to_read: { label: "Want to Read", icon: BookMarked },
  reading: { label: "Reading", icon: BookOpen },
  completed: { label: "Completed", icon: CheckCircle2 },
};

export const STATUS_ORDER: BookStatus[] = ["want_to_read", "reading", "completed"];
