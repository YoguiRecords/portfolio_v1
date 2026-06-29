"use client";

import { useState } from "react";
import { Button, Drawer, Input, Select } from "@/components/ui";

/** Stages du pipeline (miroir de l'enum Prisma `DealStage` — local pour rester côté client). */
const DEAL_STAGES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

/** Carte deal pour le board. */
export interface DealCardRow {
  id: string;
  title: string;
  contactName: string;
  valueCents: number | null;
  stage: string;
}

export interface PipelineActions {
  setStage: (form: FormData) => Promise<void>;
  create: (form: FormData) => Promise<void>;
}

const STAGE_LABEL: Record<string, string> = {
  PROSPECT: "Prospect",
  QUALIFIED: "Qualifié",
  PROPOSAL: "Proposition",
  WON: "Gagné",
  LOST: "Perdu",
};

function formatEuros(cents: number | null): string {
  if (cents == null) return "—";
  return `${(cents / 100).toLocaleString("fr-FR")} €`;
}

/** Somme des valeurs (cents) d'une colonne. */
export function columnTotal(deals: DealCardRow[]): number {
  return deals.reduce((sum, d) => sum + (d.valueCents ?? 0), 0);
}

function DealCard({ deal, setStage }: { deal: DealCardRow; setStage: PipelineActions["setStage"] }) {
  return (
    <div className="flex flex-col gap-2 rounded-control border border-border bg-surface-2 p-3">
      <div className="text-sm font-medium text-ink">{deal.title}</div>
      <div className="text-xs text-muted">{deal.contactName}</div>
      <div className="text-sm font-semibold text-accent">{formatEuros(deal.valueCents)}</div>
      <form action={setStage}>
        <input type="hidden" name="id" value={deal.id} />
        <select
          name="stage"
          defaultValue={deal.stage}
          aria-label={`Déplacer ${deal.title}`}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full rounded-control border border-border bg-surface px-2 py-1 text-xs text-ink-2 outline-none focus:border-accent"
        >
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}

/** Board pipeline : une colonne par `DealStage`, cartes déplaçables (select), totaux. */
export function PipelineBoard({
  deals,
  contacts,
  actions,
}: {
  deals: DealCardRow[];
  contacts: { id: string; name: string }[];
  actions: PipelineActions;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setCreating(true)}>
          Nouvelle affaire
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {DEAL_STAGES.map((stage) => {
          const colDeals = deals.filter((d) => d.stage === stage);
          return (
            <section key={stage} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-3">
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{STAGE_LABEL[stage]}</h2>
                <span className="text-xs text-muted">{colDeals.length}</span>
              </header>
              <div className="text-xs font-semibold text-ink-2">{formatEuros(columnTotal(colDeals))}</div>
              <div className="flex flex-col gap-2">
                {colDeals.map((d) => (
                  <DealCard key={d.id} deal={d} setStage={actions.setStage} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Drawer open={creating} onClose={() => setCreating(false)} title="Nouvelle affaire">
        <form action={actions.create} className="flex flex-col gap-3">
          <Input name="title" placeholder="Titre de l’affaire" required />
          <Select name="contactId" required defaultValue="">
            <option value="" disabled>
              Contact…
            </option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input name="valueCents" type="number" min={0} placeholder="Valeur (centimes)" />
          <Select name="stage" defaultValue="PROSPECT">
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
          <Button variant="primary" type="submit">
            Créer
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
