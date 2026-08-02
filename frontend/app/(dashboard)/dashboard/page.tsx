"use client";

import { BookOpen } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useBooks, useBookMutations } from "@/hooks/useBooks";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { BookTable } from "@/components/dashboard/BookTable";
import { BookCard } from "@/components/books/BookCard";
import { DeleteModal } from "@/components/books/DeleteModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";
import type { Book } from "@/types/book";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: books, isLoading: booksLoading } = useBooks();
  const { updateStatus, remove } = useBookMutations();
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  if (statsLoading || booksLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      {stats && <DashboardStats stats={stats} />}

      {!books || books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books yet"
          description="Add your first book to see it here."
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
