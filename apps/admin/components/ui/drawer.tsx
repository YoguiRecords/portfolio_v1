"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

/** Panneau latéral modal (fermeture par overlay ou touche Échap). */
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-5 shadow-xl"
      >
        {title ? <h2 className="mb-4 text-base font-semibold text-ink">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
