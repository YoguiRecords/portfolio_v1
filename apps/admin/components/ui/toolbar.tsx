import type { ReactNode } from "react";
import { cn } from "./cn";

/** Barre d'outils d'une liste (recherche + filtres + actions). */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="toolbar" className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}
