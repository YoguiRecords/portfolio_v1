"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/**
 * Zone d'import d'image branchée sur l'action serveur existante (validation
 * mime/taille/dimensions → webp + strip EXIF → MinIO, **inchangée**). Validation
 * client légère du type pour un retour immédiat (la vraie garde-fou reste serveur).
 */
export function Dropzone({ action }: { action: (form: FormData) => Promise<void> }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Format non autorisé : images uniquement.");
      setFileName(null);
      return;
    }
    setError(null);
    setFileName(file.name);
  }

  return (
    <form action={action} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-control border border-dashed border-border-strong bg-surface-2 px-6 py-10 text-center hover:border-accent">
        <span className="text-sm font-medium text-ink">Glissez une image ou cliquez pour choisir</span>
        <span className="text-xs text-muted">JPEG / PNG / WebP — converti en webp, EXIF supprimé</span>
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          onChange={(e) => onFile(e.target.files?.[0])}
          className="sr-only"
        />
      </label>

      <input
        name="alt"
        placeholder="Texte alternatif (accessibilité / SEO)"
        className="rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />

      {fileName ? <p className="text-xs text-ink-2">Sélectionné : {fileName}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted">Pipeline : conversion webp + suppression EXIF + stockage MinIO.</p>

      <Button variant="primary" type="submit" className="self-start">
        Importer
      </Button>
    </form>
  );
}
