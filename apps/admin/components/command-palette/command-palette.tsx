"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_NAV } from "@/components/admin-nav/admin-nav";

/** Cible de navigation rapide. */
interface Command {
  label: string;
  href: string;
}

const COMMANDS: Command[] = ADMIN_NAV.map((item) => ({ label: item.label, href: item.href }));

/**
 * Palette de commandes globale (⌘K / Ctrl+K, ou évènement `open-command-palette`
 * émis par la topbar). Recherche les sections du BO et y navigue. La recherche de
 * contenu DB (projets/articles/contacts par nom) viendra enrichir cette base.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((o) => !o);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  if (!open) return null;

  const needle = query.trim().toLowerCase();
  const results = COMMANDS.filter((c) => needle === "" || c.label.toLowerCase().includes(needle));

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className="relative w-full max-w-lg overflow-hidden rounded-card border border-border bg-surface shadow-xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Aller à… (projets, articles, contacts…)"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-muted"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Aucun résultat.</li>
          ) : (
            results.map((c) => (
              <li key={c.href}>
                <button
                  type="button"
                  onClick={() => go(c.href)}
                  className="flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
                >
                  <span>{c.label}</span>
                  <span className="text-xs text-muted">{c.href}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
