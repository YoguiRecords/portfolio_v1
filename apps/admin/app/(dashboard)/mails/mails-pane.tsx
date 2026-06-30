"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

/** Entrée de liste du panneau mails (sous-ensemble du message, date pré-sérialisée ISO). */
export interface MailListItem {
  id: string;
  fromName: string;
  subject: string;
  preview: string;
  isRead: boolean;
  receivedAt: string;
}

/** Formate une date ISO pour la liste (FR, compact). */
function fmt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

/**
 * Panneau master-detail des mails : liste persistante à gauche, détail (route
 * enfant) à droite. Responsive : en dessous de `lg`, on affiche la liste **ou**
 * le détail selon qu'un mail est ouvert (route `/mails/[id]`).
 */
export function MailsPane({
  messages,
  live,
  children,
}: {
  messages: MailListItem[];
  live: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const selectedId =
    pathname.startsWith("/mails/") ? decodeURIComponent(pathname.slice("/mails/".length)) : null;
  const hasSelection = selectedId !== null;

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
      <aside className={cn("flex-col gap-3", hasSelection ? "hidden lg:flex" : "flex")}>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-ink">Mails</h1>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              live ? "bg-ok/15 text-ok" : "bg-accent-soft text-accent",
            )}
          >
            {live ? "Boîte connectée (Exchange)" : "Mode démo"}
          </span>
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-muted">Aucun message.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border lg:sticky lg:top-6">
            {messages.map((m) => {
              const active = m.id === selectedId;
              return (
                <li key={m.id}>
                  <Link
                    href={`/mails/${encodeURIComponent(m.id)}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col gap-1 p-4 transition-colors hover:bg-surface",
                      active && "bg-surface-2",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={cn("truncate text-sm", m.isRead ? "text-ink-2" : "font-semibold text-ink")}>
                        {m.fromName}
                      </span>
                      <span className="shrink-0 text-xs text-muted">{fmt(m.receivedAt)}</span>
                    </div>
                    <span className={cn("truncate text-sm", m.isRead ? "text-muted" : "text-ink")}>
                      {!m.isRead ? "● " : ""}
                      {m.subject}
                    </span>
                    <span className="truncate text-xs text-muted">{m.preview}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className={cn("min-w-0", hasSelection ? "block" : "hidden lg:block")}>{children}</section>
    </div>
  );
}
