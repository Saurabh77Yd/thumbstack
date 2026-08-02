import { apiClient } from "@/lib/api/client";
import type { Book, BookFilters, BookInput, BookStatus, DashboardStats } from "@/types/book";

function toQueryString(filters?: BookFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

interface RawBook {
  _id: string;
  title: string;
  author: string;
  tags: string[];
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

function toBook(raw: RawBook): Book {
  const { _id, title, author, tags, status, createdAt, updatedAt } = raw;
  return { id: _id, title, author, tags, status, createdAt, updatedAt };
}

interface RawDashboardStats {
  totalBooks: number;
  wantToRead: number;
  reading: number;
  completed: number;
  recentBooks: RawBook[];
}

export const booksApi = {
  list: async (filters?: BookFilters) => {
    const raw = await apiClient.get<RawBook[]>(`/books${toQueryString(filters)}`);
    return raw.map(toBook);
  },
  create: async (input: BookInput) => toBook(await apiClient.post<RawBook>("/books", input)),
  update: async (id: string, input: Partial<BookInput>) =>
    toBook(await apiClient.put<RawBook>(`/books/${id}`, input)),
  updateStatus: async (id: string, status: BookStatus) =>
    toBook(await apiClient.put<RawBook>(`/books/${id}`, { status })),
  delete: (id: string) => apiClient.delete<null>(`/books/${id}`),
  dashboardStats: async () => {
    const raw = await apiClient.get<RawDashboardStats>("/dashboard");
    const stats: DashboardStats = { ...raw, recentBooks: raw.recentBooks.map(toBook) };
    return stats;
  },
};
