"use client";

import { Avatar, Button } from "@/components/ui";
import { Icon } from "./icons";

/**
 * Barre supérieure : recherche (placeholder ⌘K, fonctionnelle en P14),
 * notifications, bouton Créer, avatar de l'admin connecté.
 */
export function Topbar({ adminEmail }: { adminEmail: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <button
        type="button"
        aria-label="Rechercher"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        className="flex w-full max-w-sm items-center gap-2 rounded-control border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted hover:border-border-strong"
      >
        <Icon name="search" className="h-4 w-4" />
        <span className="flex-1 text-left">Rechercher…</span>
        <kbd className="rounded border border-border px-1.5 text-xs">⌘K</kbd>
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-control text-ink-2 hover:bg-surface-2"
        >
          <Icon name="bell" className="h-5 w-5" />
        </button>
        <Button variant="primary" size="sm">
          <Icon name="plus" className="h-4 w-4" />
          Créer
        </Button>
        <Avatar name={adminEmail} />
      </div>
    </header>
  );
}
