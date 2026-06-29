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
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";
const TYPES = ["SWOT", "PESTEL", "PORTER"] as const;

/** Strategic analysis editor: SWOT / PESTEL / PORTER blocks and their items. */
export default async function AnalysesPage() {
  const analyses = await listAnalyses(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Analyses stratégiques</h1>

      {analyses.map((a) => (
        <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-100">
              <span className="font-mono text-xs text-amber-400">{a.type}</span> — {a.title ?? "(sans titre)"}
            </span>
            <form action={deleteAnalysisAction}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800">
                Supprimer
              </button>
            </form>
          </div>

          <ul className="flex flex-col gap-1 pl-2">
            {a.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-2 text-sm text-zinc-300">
                <span>
                  <span className="text-xs font-semibold text-zinc-400">{it.groupLabel}</span> ·{" "}
                  {it.text ?? it.verdict}
                </span>
                <form action={deleteAnalysisItemAction}>
                  <input type="hidden" name="id" value={it.id} />
                  <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
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
            <button type="submit" className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
              + Item
            </button>
          </form>
        </div>
      ))}

      <form action={createAnalysisAction} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-700 p-4">
        <select className={input} name="type" defaultValue="SWOT">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input className={`${input} flex-1`} name="title" placeholder="Titre (optionnel)" />
        <button type="submit" className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          + Analyse
        </button>
      </form>
    </div>
  );
}
