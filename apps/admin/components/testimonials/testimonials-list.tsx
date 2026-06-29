"use client";

import { useState } from "react";
import { Button, Drawer, Segmented, Status, Textarea, type StatusVariant } from "@/components/ui";

/** Ligne témoignage (sous-ensemble du modèle, libellé relation pré-résolu). */
export interface TestimonialRow {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  relationshipLabel: string | null;
  status: string;
  content: string;
  submittedContent: string;
  isFeatured: boolean;
}

/** Server actions injectées (découple le composant client des imports serveur). */
export interface TestimonialActions {
  approve: (form: FormData) => Promise<void>;
  reject: (form: FormData) => Promise<void>;
  edit: (form: FormData) => Promise<void>;
  feature: (form: FormData) => Promise<void>;
}

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  PENDING: { variant: "review", label: "En attente" },
  APPROVED: { variant: "published", label: "Approuvé" },
  REJECTED: { variant: "draft", label: "Refusé" },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REJECTED", label: "Refusés" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

function TestimonialCard({ item, actions }: { item: TestimonialRow; actions: TestimonialActions }) {
  const meta = STATUS_META[item.status];
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <span className="font-semibold text-ink">{item.authorName}</span>
          {item.authorRole ? <span className="text-muted"> · {item.authorRole}</span> : null}
          {item.authorCompany ? <span className="text-muted"> · {item.authorCompany}</span> : null}
          {item.relationshipLabel ? (
            <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {item.relationshipLabel}
            </span>
          ) : null}
        </div>
        {meta ? <Status variant={meta.variant}>{meta.label}</Status> : <span>{item.status}</span>}
      </div>

      <form action={actions.edit} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={item.id} />
        <label className="text-xs font-semibold text-ink-2">Texte affiché (éditable)</label>
        <Textarea name="content" defaultValue={item.content} />
        <Button variant="subtle" size="sm" type="submit" className="self-start">
          Enregistrer le texte affiché
        </Button>
      </form>

      <p className="text-xs text-muted">
        <span className="font-semibold">Original (audit, non modifiable) :</span> {item.submittedContent}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <form action={actions.approve}>
          <input type="hidden" name="id" value={item.id} />
          <Button variant="primary" size="sm" type="submit">
            Approuver
          </Button>
        </form>
        <form action={actions.feature}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="isFeatured" value={item.isFeatured ? "false" : "true"} />
          <Button variant="subtle" size="sm" type="submit">
            {item.isFeatured ? "Retirer de la une" : "Mettre en avant"}
          </Button>
        </form>
        {/* Hook CRM (activé en P11) */}
        <Button variant="ghost" size="sm" disabled title="Disponible avec le CRM (P11)">
          Créer un contact
        </Button>
      </div>
    </div>
  );
}

/** File de modération des témoignages v2 (onglets statut, édition, mise en avant, refus confirmé). */
export function TestimonialsList({ items, actions }: { items: TestimonialRow[]; actions: TestimonialActions }) {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [toReject, setToReject] = useState<TestimonialRow | null>(null);

  const filtered = items.filter((t) => status === "ALL" || t.status === status);

  return (
    <div className="flex flex-col gap-4">
      <Segmented options={[...STATUS_FILTERS]} value={status} onChange={setStatus} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun témoignage.</p>
      ) : (
        filtered.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <TestimonialCard item={item} actions={actions} />
            <button
              type="button"
              onClick={() => setToReject(item)}
              className="self-end text-xs text-danger hover:underline"
            >
              Refuser ce témoignage
            </button>
          </div>
        ))
      )}

      <Drawer open={toReject !== null} onClose={() => setToReject(null)} title="Refuser le témoignage">
        <p className="text-sm text-ink-2">Confirmer le refus du témoignage de « {toReject?.authorName} » ?</p>
        <form action={actions.reject} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={toReject?.id ?? ""} />
          <Button variant="danger" type="submit">
            Refuser
          </Button>
          <Button variant="ghost" type="button" onClick={() => setToReject(null)}>
            Annuler
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
