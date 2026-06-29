"use client";

import type { ReactNode } from "react";
import { cn } from "@/components/ui";

/** Chrome « fenêtre de navigateur » autour d'un aperçu (présentationnel). */
export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-ok/60" aria-hidden />
        <span className="ml-2 text-xs text-muted">Aperçu</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * Panneau d'aperçu live **réduit et fermable**. Contrôlé : `open` pilote
 * l'affichage, `onToggle` bascule. Réutilisé par les éditeurs (projets, articles, profil).
 */
export function LivePreview({
  open,
  onToggle,
  children,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Afficher l’aperçu"
        className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2"
      >
        👁 Aperçu
      </button>
    );
  }
  return (
    <aside role="complementary" aria-label="Aperçu" className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Aperçu live</span>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Fermer l’aperçu"
          className="rounded-control px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          ✕
        </button>
      </div>
      <PreviewFrame>{children}</PreviewFrame>
    </aside>
  );
}
