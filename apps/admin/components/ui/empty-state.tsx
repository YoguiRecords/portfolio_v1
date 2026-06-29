import type { ReactNode } from "react";

/** État vide réutilisable (icône optionnelle + message + CTA). Utilisé par DataTable. */
export function EmptyState({
  message,
  icon,
  action,
}: {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
      {icon ? (
        <div className="text-muted" aria-hidden>
          {icon}
        </div>
      ) : null}
      <p className="text-sm text-muted">{message}</p>
      {action}
    </div>
  );
}
