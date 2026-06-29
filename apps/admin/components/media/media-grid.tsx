"use client";

import { useState } from "react";
import { Drawer, EmptyState } from "@/components/ui";

/** Ligne média (sous-ensemble sérialisable de MediaAsset). */
export interface MediaRow {
  id: string;
  url: string;
  alt: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  kind: string;
  durationSec: number | null;
  createdAtLabel: string;
}

/** Formate une taille en octets de façon lisible (Ko / Mo). */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function MediaDetails({ asset }: { asset: MediaRow }) {
  const rows: [string, string][] = [
    ["Nom d’origine", asset.originalName],
    ["Format", asset.mimeType],
    ["Poids", formatSize(asset.sizeBytes)],
    ["Dimensions", asset.width && asset.height ? `${asset.width} × ${asset.height}px` : "—"],
    ["Type", asset.kind],
    ["Durée", asset.durationSec ? `${asset.durationSec}s` : "—"],
    ["Texte alternatif", asset.alt ?? "—"],
    ["Ajouté le", asset.createdAtLabel],
  ];
  return (
    <div className="flex flex-col gap-4">
      {asset.kind === "IMAGE" ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu d'asset MinIO
        <img src={asset.url} alt={asset.alt ?? ""} className="w-full rounded-card border border-border object-contain" />
      ) : null}
      <dl className="flex flex-col gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border pb-2">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right text-ink-2">{value}</dd>
          </div>
        ))}
      </dl>
      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
        Ouvrir l’original ↗
      </a>
    </div>
  );
}

/** Médiathèque : grille d'assets, sélection → panneau détails. */
export function MediaGrid({ assets }: { assets: MediaRow[] }) {
  const [selected, setSelected] = useState<MediaRow | null>(null);

  if (assets.length === 0) {
    return <EmptyState message="Aucun média importé." />;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {assets.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a)}
            aria-label={`Détails de ${a.originalName}`}
            className="overflow-hidden rounded-card border border-border bg-surface text-left transition-colors hover:border-accent"
          >
            {a.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu d'asset MinIO
              <img src={a.url} alt={a.alt ?? ""} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-xs text-muted">{a.kind}</div>
            )}
          </button>
        ))}
      </div>

      <Drawer open={selected !== null} onClose={() => setSelected(null)} title="Détails du média">
        {selected ? <MediaDetails asset={selected} /> : null}
      </Drawer>
    </>
  );
}
