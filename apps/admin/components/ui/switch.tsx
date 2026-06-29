"use client";

import { cn } from "./cn";

/** Interrupteur on/off accessible (role="switch", aria-checked). */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange?: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors disabled:opacity-50",
        checked ? "border-accent bg-accent/15" : "border-border bg-surface-2",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full transition-transform",
          checked ? "translate-x-6 bg-accent" : "translate-x-1 bg-muted",
        )}
      />
    </button>
  );
}
