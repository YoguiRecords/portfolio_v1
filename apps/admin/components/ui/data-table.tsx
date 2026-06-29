import type { ReactNode } from "react";
import { cn } from "./cn";
import { EmptyState } from "./empty-state";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  emptyLabel?: string;
};

/** Table de données générique pour les listes CRUD (en-têtes, lignes, actions, état vide). */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowActions,
  emptyLabel = "Aucun élément",
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState message={emptyLabel} />;
  }
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 font-semibold", col.align === "right" && "text-right")}>
                {col.header}
              </th>
            ))}
            {rowActions ? <th className="px-4 py-3 text-right font-semibold">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-surface-2">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-ink-2", col.align === "right" && "text-right")}>
                  {col.render(row)}
                </td>
              ))}
              {rowActions ? <td className="px-4 py-3 text-right">{rowActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
