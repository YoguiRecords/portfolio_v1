import { prisma } from "@portfolio/db";
import { listTracks, listGoals } from "@/lib/content/career";
import {
  createTrackAction,
  deleteTrackAction,
  createMilestoneAction,
  deleteMilestoneAction,
  createGoalAction,
  deleteGoalAction,
} from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";
const GOAL_STATUS = ["ACHIEVED", "IN_PROGRESS", "TARGET", "HORIZON"] as const;

/** Career editor: tracks (timeline lanes) + their milestones, and the goals. */
export default async function CareerPage() {
  const [tracks, goals] = await Promise.all([listTracks(prisma), listGoals(prisma)]);

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-zinc-50">Parcours — voies & jalons</h1>

        {tracks.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colorHex }} />
                {t.name}
                <span className="font-mono text-xs text-zinc-500">{t.slug}</span>
              </span>
              <form action={deleteTrackAction}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800">
                  Supprimer la voie
                </button>
              </form>
            </div>

            <ul className="flex flex-col gap-1 pl-5">
              {t.milestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm text-zinc-300">
                  <span>
                    <span className="font-mono text-xs text-amber-400">{m.dateLabel}</span> · {m.role}
                  </span>
                  <form action={deleteMilestoneAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                      ✕
                    </button>
                  </form>
                </li>
              ))}
            </ul>

            <form action={createMilestoneAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="trackId" value={t.id} />
              <input className={input} name="dateLabel" placeholder="2024" required />
              <input className={`${input} w-20`} name="sortYear" type="number" placeholder="Année" required />
              <input className={`${input} flex-1`} name="role" placeholder="Rôle / étape" required />
              <button type="submit" className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                + Jalon
              </button>
            </form>
          </div>
        ))}

        <form action={createTrackAction} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-700 p-4">
          <input className={input} name="name" placeholder="Nom de la voie" required />
          <input className={input} name="slug" placeholder="slug" required />
          <input className={`${input} w-28`} name="colorHex" defaultValue="#f0a800" />
          <button type="submit" className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
            + Voie
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">Cap — objectifs de carrière</h2>
        <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {goals.map((g) => (
            <li key={g.id} className="flex items-center justify-between p-3 text-sm text-zinc-200">
              <span>
                {g.role} <span className="ml-2 font-mono text-xs text-amber-400">{g.status}</span>
              </span>
              <form action={deleteGoalAction}>
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createGoalAction} className="flex flex-wrap items-end gap-2">
          <input className={`${input} flex-1`} name="role" placeholder="Objectif (ex. CTO)" required />
          <select className={input} name="status" defaultValue="TARGET">
            {GOAL_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            + Objectif
          </button>
        </form>
      </section>
    </div>
  );
}
