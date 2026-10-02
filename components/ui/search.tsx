"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";

/* ============================================================
   Search — Search bar with filter chips display
   Design System §46
   ============================================================ */

export interface SearchFilter {
  key: string;
  label: string;
  value: string;
}

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  filters?: SearchFilter[];
  onRemoveFilter?: (key: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Search({
  placeholder = "Search...",
  onSearch,
  filters = [],
  onRemoveFilter,
  className,
  size = "md",
}: SearchProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(query);
  }

  return (
    <div className={clsx("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            "w-full rounded-[12px] border border-line bg-paper pl-11 pr-4 text-ink transition-colors",
            "placeholder:text-muted-label",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            size === "sm" && "py-2 text-[13.5px]",
            size === "md" && "py-3 text-[14.5px]",
            size === "lg" && "py-4 text-[16px]"
          )}
          aria-label="Search"
        />
      </form>

      {filters.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-[12.5px] font-data text-ink"
            >
              <span className="text-muted-label">{filter.label}:</span>
              {filter.value}
              {onRemoveFilter && (
                <button
                  onClick={() => onRemoveFilter(filter.key)}
                  className="ml-0.5 text-muted-label hover:text-ink transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
