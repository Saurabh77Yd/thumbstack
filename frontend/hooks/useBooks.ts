import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { booksApi } from "@/lib/api/books";
import { queryKeys } from "@/constants/queryKeys";
import type { BookFilters, BookInput, BookStatus } from "@/types/book";

export function useBooks(filters?: BookFilters) {
  return useQuery({
    queryKey: queryKeys.books(filters),
    queryFn: () => booksApi.list(filters),
  });
}

export function useBook(id: string) {
  const { data: books, ...rest } = useBooks();
  return { ...rest, data: books?.find((book) => book.id === id) };
}

export function useBookMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["books"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
  };

  const create = useMutation({
    mutationFn: (input: BookInput) => booksApi.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BookInput> }) =>
      booksApi.update(id, input),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookStatus }) =>
      booksApi.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => booksApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, remove };
}
