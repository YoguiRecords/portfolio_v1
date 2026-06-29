"use client";

import { cn } from "./cn";

/** Pagination simple (page précédente / courante / suivante). */
export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        aria-label="Page précédente"
        disabled={!canPrev}
        onClick={() => onPageChange?.(page - 1)}
        className={cn(
          "rounded-control border border-border px-2 py-1 text-ink-2 disabled:opacity-40",
          canPrev && "hover:bg-surface-2",
        )}
      >
        ‹
      </button>
      <span className="text-muted">
        Page {page} / {pageCount}
      </span>
      <button
        type="button"
        aria-label="Page suivante"
        disabled={!canNext}
        onClick={() => onPageChange?.(page + 1)}
        className={cn(
          "rounded-control border border-border px-2 py-1 text-ink-2 disabled:opacity-40",
          canNext && "hover:bg-surface-2",
        )}
      >
        ›
      </button>
    </div>
  );
}
