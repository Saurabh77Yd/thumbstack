import { Search, X } from "lucide-react";
import { STATUS_ORDER, STATUS_CONFIG } from "@/constants/status";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { BookFilters } from "@/types/book";

interface FilterBarProps {
  filters: BookFilters;
  onChange: (filters: BookFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasActiveFilters = !!filters.tag || !!filters.status;

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm">
      <div className="min-w-50 flex-1">
        <Input
          label="Search by tag"
          value={filters.tag ?? ""}
          onChange={(e) => onChange({ ...filters, tag: e.target.value || undefined })}
          placeholder="e.g. programming"
          startAdornment={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="w-44">
        <Select
          label="Status"
          value={filters.status ?? ""}
          onChange={(e) =>
            onChange({ ...filters, status: (e.target.value || undefined) as BookFilters["status"] })
          }
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
