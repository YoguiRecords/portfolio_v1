import type { ReactNode } from "react";

const STYLES = {
  published: "text-ok bg-ok/15",
  review: "text-warn bg-warn/15",
  draft: "text-muted bg-surface-2",
  archived: "text-info bg-info/15",
} as const;

export type StatusVariant = keyof typeof STYLES;

/** Pastille de statut (publié / en revue / brouillon / archivé). */
export function Status({ variant, children }: { variant: StatusVariant; children: ReactNode }) {
  return (
    <span
      data-variant={variant}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}
