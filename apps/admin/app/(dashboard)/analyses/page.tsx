import { prisma } from "@portfolio/db";
import { listAnalyses } from "@/lib/content/analysis";
import {
  createAnalysisAction,
  deleteAnalysisAction,
  createAnalysisItemAction,
  deleteAnalysisItemAction,
} from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";
const TYPES = ["SWOT", "PESTEL", "PORTER"] as const;

/** Strategic analysis editor: SWOT / PESTEL / PORTER blocks and their items. */
export default async function AnalysesPage() {
  const analyses = await listAnalyses(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-ink">Analyses stratégiques</h1>

      {analyses.map((a) => (
        <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">
              <span className="font-mono text-xs text-accent">{a.type}</span> — {a.title ?? "(sans titre)"}
            </span>
            <form action={deleteAnalysisAction}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className="rounded-md border border-border-strong px-2 py-1 text-xs text-muted hover:bg-surface-2">
                Supprimer
              </button>
            </form>
          </div>

          <ul className="flex flex-col gap-1 pl-2">
            {a.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-2 text-sm text-ink-2">
                <span>
                  <span className="text-xs font-semibold text-muted">{it.groupLabel}</span> ·{" "}
                  {it.text ?? it.verdict}
                </span>
                <form action={deleteAnalysisItemAction}>
                  <input type="hidden" name="id" value={it.id} />
                  <button type="submit" className="text-xs text-muted hover:text-danger">
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <form action={createAnalysisItemAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="analysisId" value={a.id} />
            <input className={input} name="groupLabel" placeholder="Groupe (ex. Forces)" required />
            <input className={`${input} flex-1`} name="text" placeholder="Texte (SWOT)" />
            <input className={`${input} flex-1`} name="verdict" placeholder="Lecture (PESTEL/PORTER)" />
            <button type="submit" className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
              + Item
            </button>
          </form>
        </div>
      ))}

      <form action={createAnalysisAction} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border-strong p-4">
        <select className={input} name="type" defaultValue="SWOT">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input className={`${input} flex-1`} name="title" placeholder="Titre (optionnel)" />
        <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong">
          + Analyse
        </button>
      </form>
    </div>
  );
}
