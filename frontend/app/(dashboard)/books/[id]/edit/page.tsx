"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { BookForm } from "@/components/books/BookForm";
import { useBook, useBookMutations } from "@/hooks/useBooks";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import type { BookFormInput } from "@/lib/validation/bookSchema";

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading } = useBook(id);
  const { update } = useBookMutations();
  const router = useRouter();

  const onSubmit = async (input: BookFormInput) => {
    await update.mutateAsync({ id, input });
    router.push(ROUTES.books);
  };

  if (isLoading || !book) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Edit book</h1>
      <BookForm defaultValues={book} onSubmit={onSubmit} submitLabel="Save changes" />
    </div>
  );
}
