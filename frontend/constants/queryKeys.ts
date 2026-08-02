import type { BookFilters } from "@/types/book";

export const queryKeys = {
  books: (filters?: BookFilters) => ["books", filters ?? {}] as const,
  dashboardStats: () => ["dashboard-stats"] as const,
};
