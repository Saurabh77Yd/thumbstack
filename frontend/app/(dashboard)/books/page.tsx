"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { useBooks, useBookMutations } from "@/hooks/useBooks";
import { useDebounce } from "@/hooks/useDebounce";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { BookTable } from "@/components/dashboard/BookTable";
import { BookCard } from "@/components/books/BookCard";
import { DeleteModal } from "@/components/books/DeleteModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import type { Book, BookFilters } from "@/types/book";

export default function BooksPage() {
  const [filters, setFilters] = useState<BookFilters>({});
  const debouncedFilters = useDebounce(filters, 300);
  const { data: books, isLoading } = useBooks(debouncedFilters);
  const { updateStatus, remove } = useBookMutations();
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Books</h1>
          <p className="mt-0.5 text-sm text-foreground/50">Browse and manage your reading list</p>
        </div>
        <Link href={ROUTES.newBook}>
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add book
          </Button>
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !books || books.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No books found"
          description="Try adjusting your filters, or add a new book."
        />
      ) : (
        <>
          <BookTable
            books={books}
            onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
            onDelete={setBookToDelete}
          />
          <div className="flex flex-col gap-3 md:hidden">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onStatusChange={(status) => updateStatus.mutate({ id: book.id, status })}
                onDelete={setBookToDelete}
              />
            ))}
          </div>
        </>
      )}

      <DeleteModal
        isOpen={!!bookToDelete}
        bookTitle={bookToDelete?.title ?? ""}
        isDeleting={remove.isPending}
        onConfirm={() => {
          if (bookToDelete) {
            remove.mutate(bookToDelete.id, { onSuccess: () => setBookToDelete(null) });
          }
        }}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
}
