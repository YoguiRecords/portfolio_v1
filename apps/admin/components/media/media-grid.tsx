"use client";

import { useActionState, useState } from "react";
import { Button, Drawer, EmptyState } from "@/components/ui";
import type { DeleteMediaState } from "@/lib/actions/media-actions";

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

/** Suppression en deux temps (armement anti-clic accidentel) + garde d'usage serveur. */
function DeleteMediaPanel({
  asset,
  action,
  onDeleted,
}: {
  asset: MediaRow;
  action: (prev: DeleteMediaState, form: FormData) => Promise<DeleteMediaState>;
  onDeleted: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: DeleteMediaState, form: FormData) => {
    const next = await action(prev, form);
    if (next.ok) onDeleted();
    return next;
  }, {});

  return (
    <div className="border-t border-border pt-3">
      {armed ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={asset.id} />
          <p className="text-sm text-ink-2">
            Supprimer définitivement « {asset.originalName} » ? Le fichier sera retiré du stockage.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" type="submit" disabled={pending}>
              {pending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setArmed(false)}>
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="subtle" size="sm" type="button" onClick={() => setArmed(true)}>
          Supprimer
        </Button>
      )}
      {state.error ? <p className="mt-2 text-sm text-danger">{state.error}</p> : null}
    </div>
  );
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

/** Médiathèque : grille d'assets, sélection → panneau détails (+ suppression gardée). */
export function MediaGrid({
  assets,
  deleteAction,
}: {
  assets: MediaRow[];
  deleteAction: (prev: DeleteMediaState, form: FormData) => Promise<DeleteMediaState>;
}) {
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
        {selected ? (
          <div className="flex flex-col gap-4">
            <MediaDetails asset={selected} />
            <DeleteMediaPanel asset={selected} action={deleteAction} onDeleted={() => setSelected(null)} />
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
