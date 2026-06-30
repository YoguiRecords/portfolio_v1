"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Segmented, cn } from "@/components/ui";
import type { InboxFilter, InboxItem } from "@/lib/inbox/aggregate";

const FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "MAIL", label: "✉ Mail" },
  { value: "CONTACT", label: "📨 Contact" },
] as const;

/** Boîte de réception unifiée : liste filtrable (Mail / Contact), non-lus en gras. */
export function InboxList({ items }: { items: InboxItem[] }) {
  const [filter, setFilter] = useState<InboxFilter>("ALL");
  const pathname = usePathname();
  const filtered = items.filter((i) => filter === "ALL" || i.source === filter);

  return (
    <div className="flex flex-col gap-4">
      <Segmented options={[...FILTERS]} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun message.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
          {filtered.map((i) => {
            const href = `/inbox/${i.source.toLowerCase()}/${encodeURIComponent(i.id)}`;
            const active = pathname === href;
            return (
            <li key={`${i.source}-${i.id}`}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 p-3 transition-colors hover:bg-surface-2",
                  active && "bg-surface-2",
                )}
              >
                <span aria-hidden className="text-xs">
                  {i.source === "MAIL" ? "✉" : "📨"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={i.isRead ? "truncate text-sm text-ink-2" : "truncate text-sm font-semibold text-ink"}>
                    {i.from} — {i.subject}
                  </div>
                  <div className="truncate text-xs text-muted">{i.preview}</div>
                </div>
                <time className="shrink-0 text-xs text-muted">{new Date(i.date).toLocaleDateString("fr-FR")}</time>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
