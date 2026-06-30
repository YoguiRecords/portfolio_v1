import Link from "next/link";
import { KpiCard, Panel } from "@/components/ui";
import { getMissionControlData } from "@/lib/data/mission-control";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  PROSPECT: "Prospect",
  QUALIFIED: "Qualifié",
  PROPOSAL: "Proposition",
  WON: "Gagné",
  LOST: "Perdu",
};

function euros(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR")} €`;
}

/** Mission Control: client-relationship piloting + things to handle (distinct from Dashboard). */
export default async function MissionControlPage() {
  const { kpis, pipeline, tasks, toTreat, inboxPreview } = await getMissionControlData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mission Control</h1>
        <p className="text-sm text-muted">Pilotage de la relation client et de ce qu’il reste à traiter.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Contacts" value={kpis.contacts} />
        <KpiCard label="Affaires ouvertes" value={kpis.openDeals} />
        <KpiCard label="Non-lus" value={kpis.unread} trend={kpis.unread > 0 ? "up" : "flat"} />
        <KpiCard label="Tâches en attente" value={kpis.pendingTasks} trend={kpis.pendingTasks > 0 ? "up" : "flat"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pipeline">
          {pipeline.length === 0 ? (
            <p className="text-sm text-muted">Aucune affaire.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pipeline.map((p) => (
                <li key={p.stage} className="flex items-center justify-between text-sm">
                  <span className="text-ink-2">{STAGE_LABEL[p.stage] ?? p.stage}</span>
                  <span className="text-muted">
                    {p.count} · {euros(p.valueCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="À traiter">
          <ul className="flex flex-col divide-y divide-border">
            <li>
              <Link href="/temoignages" className="flex justify-between py-2 text-sm text-ink-2 hover:text-ink">
                <span>Témoignages à valider</span>
                <span className={toTreat.pendingTestimonials > 0 ? "font-bold text-accent" : "text-muted"}>
                  {toTreat.pendingTestimonials}
                </span>
              </Link>
            </li>
            <li>
              <Link href="/rdv" className="flex justify-between py-2 text-sm text-ink-2 hover:text-ink">
                <span>RDV à confirmer</span>
                <span className={toTreat.pendingAppointments > 0 ? "font-bold text-accent" : "text-muted"}>
                  {toTreat.pendingAppointments}
                </span>
              </Link>
            </li>
            <li>
              <Link href="/articles" className="flex justify-between py-2 text-sm text-ink-2 hover:text-ink">
                <span>Articles en brouillon</span>
                <span className={toTreat.draftArticles > 0 ? "font-bold text-accent" : "text-muted"}>
                  {toTreat.draftArticles}
                </span>
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Tâches du jour" action={<Link href="/taches" className="text-xs text-accent hover:underline">Tout voir</Link>}>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted">Aucune tâche aujourd’hui.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex justify-between text-sm">
                  <span className="text-ink-2">{t.title}</span>
                  <span className="text-muted">{t.dueAtLabel ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Boîte de réception" action={<Link href="/inbox" className="text-xs text-accent hover:underline">Tout voir</Link>}>
          {inboxPreview.length === 0 ? (
            <p className="text-sm text-muted">Aucun message.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {inboxPreview.map((i) => (
                <li key={`${i.source}-${i.id}`}>
                  <Link
                    href={`/inbox/${i.source.toLowerCase()}/${encodeURIComponent(i.id)}`}
                    className="flex justify-between gap-3 text-sm hover:text-ink"
                  >
                    <span className={i.isRead ? "truncate text-ink-2" : "truncate font-semibold text-ink"}>
                      {i.from} — {i.subject}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
