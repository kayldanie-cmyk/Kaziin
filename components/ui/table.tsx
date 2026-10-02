import clsx from "clsx";
import type { ReactNode } from "react";

/* ============================================================
   Table — Data table with sortable headers
   Design System §46
   ============================================================ */

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data to display.",
  className,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={clsx("border border-line rounded-[14px] overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-paper">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    "px-4 py-3 text-[12px] font-data font-medium text-muted-label uppercase tracking-wider whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-[14px] text-muted-label bg-paper"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={clsx(
                    "bg-paper",
                    onRowClick && "cursor-pointer hover:bg-paper transition-colors"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        "px-4 py-3 text-[14px]",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   Pagination
   ============================================================ */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className={clsx("flex items-center gap-1", className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-[13px] font-medium text-muted-label hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed rounded-[8px] hover:bg-paper transition-colors"
        aria-label="Previous page"
      >
        ← Previous
      </button>
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="px-2 text-[13px] text-muted-label">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              "w-9 h-9 rounded-[8px] text-[13px] font-medium transition-colors",
              page === currentPage
                ? "bg-accent text-white"
                : "text-muted-label hover:bg-paper hover:text-ink"
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-[13px] font-medium text-muted-label hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed rounded-[8px] hover:bg-paper transition-colors"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

/* ============================================================
   Filter — Active filter chips
   ============================================================ */

export interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function Filter({ filters, onRemove, onClearAll, className }: FilterProps) {
  if (filters.length === 0) return null;

  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-data"
        >
          <span className="text-muted-label">{filter.label}:</span>
          <span className="text-accent-dark font-medium">{filter.value}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-0.5 text-muted-label hover:text-accent-dark transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-[12.5px] text-muted-label hover:text-ink transition-colors font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
