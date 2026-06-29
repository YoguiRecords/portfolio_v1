import type { ReactNode } from "react";
import { cn } from "./cn";

/** Barre d'enregistrement sticky en bas (statut + actions). */
export function SaveBar({
  status,
  children,
  className,
}: {
  status?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      <span className="text-xs text-muted">{status}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
