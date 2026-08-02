import { STATUS_CONFIG } from "@/constants/status";
import type { BookStatus } from "@/types/book";

export function StatusBadge({ status }: { status: BookStatus }) {
  const { label, icon: Icon } = STATUS_CONFIG[status];
  return (
    <span className={`status-chip status-chip-${status}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
