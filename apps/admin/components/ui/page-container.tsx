import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Paliers de largeur du contenu d'une page du BO. Source unique de vérité pour
 * éviter les `max-w-*` copiés-collés page par page.
 * - `full`    : pleine largeur (listes, boards, calendrier, pages 2 colonnes).
 * - `editor`  : éditeurs riches (markdown + aperçu, formulaires denses).
 * - `reading` : lecture/édition linéaire confortable (FAQ, détail message…).
 */
export type PageWidth = "full" | "editor" | "reading";

const WIDTH: Record<PageWidth, string> = {
  full: "max-w-none",
  editor: "max-w-6xl",
  reading: "max-w-3xl",
};

const GAP: Record<NonNullable<PageContainerProps["gap"]>, string> = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
};

type PageContainerProps = {
  /** Palier de largeur (défaut : `full`). */
  width?: PageWidth;
  /** Espacement vertical entre blocs (défaut : 6). */
  gap?: 4 | 6 | 8 | 10;
  children: ReactNode;
  className?: string;
};

/**
 * Conteneur racine d'une page du BO : empile les blocs verticalement et applique
 * un palier de largeur cohérent. Remplace les `flex max-w-* flex-col gap-*` ad hoc.
 */
export function PageContainer({ width = "full", gap = 6, children, className }: PageContainerProps) {
  return <div className={cn("flex flex-col", WIDTH[width], GAP[gap], className)}>{children}</div>;
}
