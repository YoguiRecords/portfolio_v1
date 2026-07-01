import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { listTracks, listGoals } from "@/lib/content/career";
import {
  createTrackAction,
  deleteTrackAction,
  createMilestoneAction,
  deleteMilestoneAction,
  createGoalAction,
  deleteGoalAction,
  updateGoalAction,
  moveGoalAction,
} from "@/lib/actions/career-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";
const GOAL_STATUS = ["ACHIEVED", "IN_PROGRESS", "TARGET", "HORIZON"] as const;

/** Career editor: tracks (timeline lanes) + their milestones, and the goals. */
export default async function CareerPage() {
  await requirePermission("career");
  const [tracks, goals] = await Promise.all([listTracks(prisma), listGoals(prisma)]);

  return (
    <PageContainer width="full">
      <div className="grid items-start gap-6 xl:grid-cols-2">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-ink">Parcours — voies & jalons</h1>

        {tracks.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colorHex }} />
                {t.name}
                <span className="font-mono text-xs text-muted">{t.slug}</span>
              </span>
              <form action={deleteTrackAction}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmSubmitButton label="Supprimer la voie" />
              </form>
            </div>

            <ul className="flex flex-col gap-1 pl-5">
              {t.milestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm text-ink-2">
                  <span>
                    <span className="font-mono text-xs text-accent">{m.dateLabel}</span> · {m.role}
                  </span>
                  <form action={deleteMilestoneAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmSubmitButton label="✕" />
                  </form>
                </li>
              ))}
            </ul>

            <form action={createMilestoneAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="trackId" value={t.id} />
              <input className={input} name="dateLabel" placeholder="2024" required />
              <input className={`${input} w-20`} name="sortYear" type="number" placeholder="Année" required />
              <input className={`${input} flex-1`} name="role" placeholder="Rôle / étape" required />
              <button type="submit" className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
                + Jalon
              </button>
            </form>
          </div>
        ))}

        <form action={createTrackAction} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border-strong p-4">
          <input className={input} name="name" placeholder="Nom de la voie" required />
          <input className={input} name="slug" placeholder="slug" required />
          <input className={`${input} w-28`} name="colorHex" defaultValue="#f0a800" />
          <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong">
            + Voie
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Cap — objectifs de carrière</h2>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {goals.map((g, i) => (
            <li key={g.id} className="flex flex-wrap items-end gap-2 p-3 text-sm text-ink-2">
              <form action={updateGoalAction} className="flex flex-1 flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="order" value={g.order} />
                <input className={`${input} flex-1`} name="role" defaultValue={g.role} required />
                <select className={input} name="status" defaultValue={g.status}>
                  {GOAL_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
                >
                  Enregistrer
                </button>
              </form>
              <form action={moveGoalAction}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="dir" value="up" />
                <button
                  type="submit"
                  disabled={i === 0}
                  className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 disabled:opacity-40"
                  aria-label="Monter"
                >
                  ↑
                </button>
              </form>
              <form action={moveGoalAction}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="dir" value="down" />
                <button
                  type="submit"
                  disabled={i === goals.length - 1}
                  className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 disabled:opacity-40"
                  aria-label="Descendre"
                >
                  ↓
                </button>
              </form>
              <form action={deleteGoalAction}>
                <input type="hidden" name="id" value={g.id} />
                <ConfirmSubmitButton label="✕" />
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
          <button type="submit" className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
            + Objectif
          </button>
        </form>
      </section>
      </div>
    </PageContainer>
  );
}
