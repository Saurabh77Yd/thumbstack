"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookFormInput } from "@/lib/validation/bookSchema";
import { STATUS_ORDER, STATUS_CONFIG } from "@/constants/status";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TagSelector } from "@/components/books/TagSelector";

interface BookFormProps {
  defaultValues?: Partial<BookFormInput>;
  onSubmit: (input: BookFormInput) => void | Promise<void>;
  submitLabel?: string;
}

export function BookForm({ defaultValues, onSubmit, submitLabel = "Save" }: BookFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookFormInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      tags: [],
      status: "want_to_read",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Title" error={errors.title?.message} {...register("title")} />
      <Input label="Author" error={errors.author?.message} {...register("author")} />
      <Controller
        control={control}
        name="tags"
        render={({ field }) => <TagSelector tags={field.value} onChange={field.onChange} />}
      />
      <Select label="Status" {...register("status")}>
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_CONFIG[status].label}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
