"use client";

import { useRouter } from "next/navigation";
import { BookForm } from "@/components/books/BookForm";
import { useBookMutations } from "@/hooks/useBooks";
import { ROUTES } from "@/constants/routes";
import type { BookFormInput } from "@/lib/validation/bookSchema";

export default function NewBookPage() {
  const { create } = useBookMutations();
  const router = useRouter();

  const onSubmit = async (input: BookFormInput) => {
    await create.mutateAsync(input);
    router.push(ROUTES.books);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Add book</h1>
      <BookForm onSubmit={onSubmit} submitLabel="Add book" />
    </div>
  );
}
