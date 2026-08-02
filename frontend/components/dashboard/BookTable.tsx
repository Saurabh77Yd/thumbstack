import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { STATUS_ORDER, STATUS_CONFIG } from "@/constants/status";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/books/StatusBadge";
import type { Book, BookStatus } from "@/types/book";

interface BookTableProps {
  books: Book[];
  onStatusChange: (id: string, status: BookStatus) => void;
  onDelete: (book: Book) => void;
}

export function BookTable({ books, onStatusChange, onDelete }: BookTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-foreground/2 text-xs uppercase text-foreground/50">
          <tr>
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Author</th>
            <th className="px-5 py-3 font-medium">Tags</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              className="border-t border-foreground/8 transition-all duration-300 hover:bg-[linear-gradient(135deg,rgba(0,212,196,0.08),rgba(49,130,246,0.08)_45%,rgba(123,63,242,0.08))] hover:shadow-[inset_0_0_0_1px_rgba(49,130,246,0.25)]"
            >
              <td className="px-5 py-4">
                <Link
                  href={ROUTES.editBook(book.id)}
                  className="font-medium text-foreground transition-colors hover:text-brand-mid"
                >
                  {book.title}
                </Link>
              </td>
              <td className="px-5 py-4 text-foreground/60">{book.author}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1">
                  {book.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={book.status} />
                  <Select
                    size="sm"
                    value={book.status}
                    onChange={(e) => onStatusChange(book.id, e.target.value as BookStatus)}
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </Select>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={ROUTES.editBook(book.id)}
                    aria-label={`Edit ${book.title}`}
                    className="text-foreground/40 transition-colors hover:text-brand-mid"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(book)}
                    aria-label={`Delete ${book.title}`}
                    className="text-foreground/40 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
