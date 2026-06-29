import { prisma } from "@portfolio/db";
import { listEvents } from "@/lib/content/event";
import { createEventAction, deleteEventAction, generateNewsAction } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Agenda editor — event CRUD + manual "generate news from event". */
export default async function AdminAgendaPage() {
  const events = await listEvents(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Agenda</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {events.length === 0 ? (
          <li className="p-4 text-sm text-zinc-500">Aucun évènement.</li>
        ) : (
          events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-semibold text-zinc-100">{e.title}</div>
                <div className="text-xs text-zinc-500">
                  {e.startAt.toISOString().slice(0, 16)} · {e.visibility} · {e.status}
                </div>
              </div>
              <div className="flex gap-2">
                <form action={generateNewsAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                    Générer une actu
                  </button>
                </form>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>

      <form action={createEventAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Nouvel évènement</h2>
        <input className={inputCls} name="title" placeholder="Titre" required />
        <input className={inputCls} name="slug" placeholder="slug-evenement" required />
        <input className={inputCls} name="startAt" type="datetime-local" required />
        <input className={inputCls} name="locationName" placeholder="Lieu" />
        <input className={inputCls} name="city" placeholder="Ville" />
        <input className={inputCls} name="registrationUrl" placeholder="https://inscription…" />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="isOnline" /> En ligne
        </label>
        <select className={inputCls} name="status" defaultValue="DRAFT">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
        </select>
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Créer
        </button>
      </form>
    </div>
  );
}
