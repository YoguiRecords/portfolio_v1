"use client";

import { cn } from "./cn";

export type SegmentedOption<T extends string> = { value: T; label: string };

/** Filtre segmenté type onglets-pills (une seule option active). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange?: (value: T) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-control border border-border bg-surface p-1" role="group">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors",
              active ? "bg-accent/15 text-accent" : "text-muted hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
