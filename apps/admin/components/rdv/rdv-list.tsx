"use client";

import { useState } from "react";
import { Button, Drawer, Segmented, Status, type StatusVariant } from "@/components/ui";

/** Ligne demande de RDV (sous-ensemble d'AppointmentRequest, date pré-formatée). */
export interface RdvRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  message: string | null;
  status: string;
  requestedAtLabel: string | null;
}

/** Server actions injectées. */
export interface RdvActions {
  confirm: (form: FormData) => Promise<void>;
  decline: (form: FormData) => Promise<void>;
  cancel: (form: FormData) => Promise<void>;
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
  { value: "CANCELLED", label: "Annulés" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const inputCls =
  "w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/**
 * File des demandes de RDV : geste **accepter / refuser / annuler** (distinct de
 * la boîte de réception). L'acceptation crée un évènement de calendrier et
 * envoie l'email de confirmation (avec le lien/lieu saisi). Refuser ou annuler
 * libère le créneau et notifie le visiteur.
 */
export function RdvList({ requests, actions }: { requests: RdvRow[]; actions: RdvActions }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [toDecline, setToDecline] = useState<RdvRow | null>(null);
  const [toCancel, setToCancel] = useState<RdvRow | null>(null);

  const filtered = requests.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <Segmented options={[...FILTERS]} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucune demande.</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <div key={r.id} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {r.name} <span className="font-normal text-muted">· {r.email}</span>
                  </span>
                  {meta ? <Status variant={meta.variant}>{meta.label}</Status> : <span>{r.status}</span>}
                </div>
                {r.phone ? <div className="text-xs text-muted">☎ {r.phone}</div> : null}
                {r.topic ? <div className="text-sm text-ink-2">{r.topic}</div> : null}
                {r.requestedAtLabel ? (
                  <div className="text-xs text-muted">Créneau : {r.requestedAtLabel}</div>
                ) : null}
                {r.message ? <p className="text-sm text-muted">{r.message}</p> : null}

                {r.status === "PENDING" ? (
                  <form action={actions.confirm} className="mt-1 flex flex-col gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input className={inputCls} name="joinInfo" placeholder="Lien de réunion / lieu (optionnel)" />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" type="submit">
                        Accepter
                      </Button>
                      <Button variant="subtle" size="sm" type="button" onClick={() => setToDecline(r)}>
                        Refuser
                      </Button>
                    </div>
                  </form>
                ) : null}

                {r.status === "CONFIRMED" ? (
                  <Button variant="subtle" size="sm" type="button" className="self-start" onClick={() => setToCancel(r)}>
                    Annuler
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
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

      <Drawer open={toCancel !== null} onClose={() => setToCancel(null)} title="Annuler le rendez-vous">
        <p className="text-sm text-ink-2">
          Annuler le rendez-vous confirmé de « {toCancel?.name} » ? Le créneau sera libéré et le
          visiteur prévenu par email.
        </p>
        <form action={actions.cancel} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={toCancel?.id ?? ""} />
          <Button variant="danger" type="submit">
            Annuler le RDV
          </Button>
          <Button variant="ghost" type="button" onClick={() => setToCancel(null)}>
            Retour
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
