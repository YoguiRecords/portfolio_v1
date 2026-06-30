import { prisma } from "@portfolio/db";
import { Button, ConfirmSubmitButton, Status } from "@/components/ui";
import { listEvents } from "@/lib/content/event";
import { createEventAction, deleteEventAction, generateNewsAction } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

const STATUS_LABEL: Record<string, string> = { DRAFT: "Brouillon", SCHEDULED: "Programmé", PUBLISHED: "Publié" };

/** Agenda editor v2 — event CRUD + "generate news from event". */
export default async function AdminAgendaPage() {
  const events = await listEvents(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink">Agenda</h1>

      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
        {events.length === 0 ? (
          <li className="p-4 text-sm text-muted">Aucun évènement.</li>
        ) : (
          events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-semibold text-ink">{e.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {e.startAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · {e.visibility}
                  <Status variant={e.status === "PUBLISHED" ? "published" : "draft"}>
                    {STATUS_LABEL[e.status] ?? e.status}
                  </Status>
                </div>
              </div>
              <div className="flex gap-2">
                <form action={generateNewsAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <Button variant="subtle" size="sm" type="submit">
                    Générer une actu
                  </Button>
                </form>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmSubmitButton label="Supprimer" />
                </form>
              </div>
            </li>
          ))
        )}
      </ul>

      <form action={createEventAction} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink-2">Nouvel évènement</h2>
        <input className={inputCls} name="title" placeholder="Titre" required />
        <input className={inputCls} name="slug" placeholder="slug-evenement" required />
        <input className={inputCls} name="startAt" type="datetime-local" required />
        <input className={inputCls} name="locationName" placeholder="Lieu" />
        <input className={inputCls} name="city" placeholder="Ville" />
        <input className={inputCls} name="registrationUrl" placeholder="https://inscription…" />
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="isOnline" /> En ligne
        </label>
        <select className={inputCls} name="status" defaultValue="DRAFT">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
        </select>
        <Button variant="primary" type="submit" className="self-start">
          Créer
        </Button>
      </form>
    </div>
  );
}
