export type BookStatus = "want_to_read" | "reading" | "completed";

export interface Book {
  id: string;
  title: string;
  author: string;
  tags: string[];
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;

export interface BookFilters {
  tag?: string;
  status?: BookStatus;
}

export interface DashboardStats {
  totalBooks: number;
  wantToRead: number;
  reading: number;
  completed: number;
  recentBooks: Book[];
}
