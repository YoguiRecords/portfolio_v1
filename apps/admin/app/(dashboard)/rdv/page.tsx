import { prisma } from "@portfolio/db";
import { listAppointments } from "@/lib/content/moderation";
import { confirmAppointmentAction, declineAppointmentAction } from "@/lib/actions/moderation-actions";

export const dynamic = "force-dynamic";

const btn = "rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800";

/** Appointment requests inbox: confirm / decline. */
export default async function AppointmentsPage() {
  const requests = await listAppointments(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-50">Demandes de rendez-vous</h1>
      {requests.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune demande.</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">
                {r.name} · {r.email}
              </span>
              <span className="text-xs uppercase tracking-wide text-amber-400">{r.status}</span>
            </div>
            {r.topic ? <div className="text-sm text-zinc-300">{r.topic}</div> : null}
            {r.requestedAt ? (
              <div className="text-xs text-zinc-500">
                Créneau souhaité : {r.requestedAt.toISOString().slice(0, 16)}
              </div>
            ) : null}
            {r.message ? <p className="text-sm text-zinc-400">{r.message}</p> : null}
            <div className="flex gap-2">
              <form action={confirmAppointmentAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className={btn}>Confirmer</button>
              </form>
              <form action={declineAppointmentAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className={btn}>Refuser</button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
