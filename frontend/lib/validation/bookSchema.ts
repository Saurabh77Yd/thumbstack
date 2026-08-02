import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  author: z.string().trim().min(1, "Author is required").max(200),
  tags: z.array(z.string().trim().min(1)),
  status: z.enum(["want_to_read", "reading", "completed"]),
});

export type BookFormInput = z.infer<typeof bookSchema>;
