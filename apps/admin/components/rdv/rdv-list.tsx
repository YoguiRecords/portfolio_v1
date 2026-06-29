"use client";

import { useState } from "react";
import { Button, Drawer, Segmented, Status, type StatusVariant } from "@/components/ui";

/** Ligne demande de RDV (sous-ensemble d'AppointmentRequest, date pré-formatée). */
export interface RdvRow {
  id: string;
  name: string;
  email: string;
  topic: string | null;
  message: string | null;
  status: string;
  requestedAtLabel: string | null;
}

/** Server actions injectées. */
export interface RdvActions {
  confirm: (form: FormData) => Promise<void>;
  decline: (form: FormData) => Promise<void>;
}

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  PENDING: { variant: "review", label: "En attente" },
  CONFIRMED: { variant: "published", label: "Confirmé" },
  DECLINED: { variant: "draft", label: "Refusé" },
  CANCELLED: { variant: "archived", label: "Annulé" },
};

const FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmés" },
  { value: "DECLINED", label: "Refusés" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

/**
 * File des demandes de RDV : geste **accepter / refuser** (distinct de la boîte
 * de réception). L'acceptation crée un évènement de calendrier (côté action).
 */
export function RdvList({ requests, actions }: { requests: RdvRow[]; actions: RdvActions }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [toDecline, setToDecline] = useState<RdvRow | null>(null);

  const filtered = requests.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <Segmented options={[...FILTERS]} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucune demande.</p>
      ) : (
        filtered.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <div key={r.id} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  {r.name} <span className="font-normal text-muted">· {r.email}</span>
                </span>
                {meta ? <Status variant={meta.variant}>{meta.label}</Status> : <span>{r.status}</span>}
              </div>
              {r.topic ? <div className="text-sm text-ink-2">{r.topic}</div> : null}
              {r.requestedAtLabel ? (
                <div className="text-xs text-muted">Créneau souhaité : {r.requestedAtLabel}</div>
              ) : null}
              {r.message ? <p className="text-sm text-muted">{r.message}</p> : null}
              {r.status === "PENDING" ? (
                <div className="flex gap-2">
                  <form action={actions.confirm}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button variant="primary" size="sm" type="submit">
                      Accepter
                    </Button>
                  </form>
                  <Button variant="subtle" size="sm" type="button" onClick={() => setToDecline(r)}>
                    Refuser
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })
      )}

      <Drawer open={toDecline !== null} onClose={() => setToDecline(null)} title="Refuser la demande">
        <p className="text-sm text-ink-2">Confirmer le refus de la demande de « {toDecline?.name} » ?</p>
        <form action={actions.decline} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={toDecline?.id ?? ""} />
          <Button variant="danger" type="submit">
            Refuser
          </Button>
          <Button variant="ghost" type="button" onClick={() => setToDecline(null)}>
            Annuler
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
