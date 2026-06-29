import type { ReactNode } from "react";
import { cn } from "./cn";

/** Panneau de contenu (entête optionnelle avec titre + action, puis corps). */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const hasHeader = Boolean(title) || Boolean(action);
  return (
    <section className={cn("rounded-card border border-border bg-surface", className)}>
      {hasHeader ? (
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          {title ? <h2 className="text-sm font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
