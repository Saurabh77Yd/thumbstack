import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/lib/api/books";
import { queryKeys } from "@/constants/queryKeys";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: booksApi.dashboardStats,
  });
}
