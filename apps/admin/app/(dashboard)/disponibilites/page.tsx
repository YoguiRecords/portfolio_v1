import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { Button, ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { listUnavailabilities } from "@/lib/booking/unavailability";
import { createUnavailabilityAction, deleteUnavailabilityAction } from "@/lib/actions/unavailability-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/**
 * Availability / holidays editor. Yohan is open Mon–Sat 9h→20h by default;
 * anything declared here (plus his Outlook events and booked RDV) blocks the
 * matching slots so Friday never offers them.
 */
export default async function AvailabilityPage() {
  await requirePermission("appointments");
  const items = await listUnavailabilities(prisma);

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-bold text-ink">Disponibilités</h1>
      <p className="text-sm text-muted">
        Ouvert par défaut du lundi au samedi, 9h→20h (créneaux de 30 min). Déclarez ici vos
        congés ou blocages : les créneaux concernés disparaissent des propositions de Friday.
        Vos rendez-vous Outlook bloquent aussi automatiquement les créneaux.
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
          {items.length === 0 ? (
            <li className="p-4 text-sm text-muted">Aucune indisponibilité déclarée.</li>
          ) : (
            items.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-semibold text-ink">{u.reason ?? "Indisponible"}</div>
                  <div className="text-xs text-muted">
                    {u.startAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    {" → "}
                    {u.endAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                <form action={deleteUnavailabilityAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <ConfirmSubmitButton label="Supprimer" />
                </form>
              </li>
            ))
          )}
        </ul>

        <form
          action={createUnavailabilityAction}
          className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 xl:sticky xl:top-6"
        >
          <h2 className="text-sm font-semibold text-ink-2">Nouvelle indisponibilité</h2>
          <label className="text-xs text-muted" htmlFor="u-start">
            Début
          </label>
          <input id="u-start" className={inputCls} name="startAt" type="datetime-local" required />
          <label className="text-xs text-muted" htmlFor="u-end">
            Fin
          </label>
          <input id="u-end" className={inputCls} name="endAt" type="datetime-local" required />
          <input className={inputCls} name="reason" placeholder="Motif (ex. Congés, Médecin)" maxLength={200} />
          <Button variant="primary" type="submit" className="self-start">
            Bloquer
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
