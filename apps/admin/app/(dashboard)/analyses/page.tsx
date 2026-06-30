import { prisma } from "@portfolio/db";
import {
  ANALYSIS_DEFAULTS,
  ANALYSIS_TYPE_LABELS,
  parseAnalysis,
  type AnalysisType,
  type SwotDataType,
  type FourPDataType,
  type GoldenCircleDataType,
  type IkigaiDataType,
} from "@portfolio/core";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { listAnalyses } from "@/lib/content/analysis";
import { upsertAnalysisAction, deleteAnalysisAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";
const area = `${input} min-h-[84px] w-full font-mono text-xs`;
const lbl = "text-[11px] font-semibold uppercase tracking-wide text-muted";

const ORDER: Record<AnalysisType, number> = { SWOT: 0, FOUR_P: 1, GOLDEN_CIRCLE: 2, IKIGAI: 3 };

/** Profile analyses editor: SWOT / 4P / Golden Circle / Ikigai (one per type). */
export default async function AnalysesPage() {
  const analyses = await listAnalyses(prisma);
  const byType = new Map(analyses.map((a) => [a.type as AnalysisType, a]));

  const metaOf = (type: AnalysisType) => {
    const a = byType.get(type);
    return { title: a?.title ?? "", order: a?.order ?? ORDER[type], isVisible: a?.isVisible ?? true };
  };
  const dataOf = <T,>(type: AnalysisType): T => {
    const a = byType.get(type);
    const parsed = a ? parseAnalysis(type, a.data) : null;
    return (parsed?.data ?? ANALYSIS_DEFAULTS[type]) as unknown as T;
  };

  const swot = dataOf<SwotDataType>("SWOT");
  const fourP = dataOf<FourPDataType>("FOUR_P");
  const golden = dataOf<GoldenCircleDataType>("GOLDEN_CIRCLE");
  const ikigai = dataOf<IkigaiDataType>("IKIGAI");

  return (
    <PageContainer width="full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink">Analyses du profil</h1>
        <p className="text-sm text-muted">
          Quatre cadres appliqués à ton profil (SWOT · 4P · Golden Circle · Ikigai). Une puce par
          ligne dans les zones de texte. PESTEL / PORTER vivent sur les fiches projet.
        </p>
      </div>

      <div className="mt-4 grid items-start gap-6 2xl:grid-cols-2">
        {/* ───────── SWOT ───────── */}
        <Editor type="SWOT" meta={metaOf("SWOT")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((k) => (
              <fieldset key={k} className="flex flex-col gap-1.5">
                <label className={lbl}>Libellé</label>
                <input className={input} name={`${k}Label`} defaultValue={swot[k].label} />
                <label className={lbl}>Puces (une par ligne)</label>
                <textarea
                  className={area}
                  name={`${k}Items`}
                  defaultValue={swot[k].items.join("\n")}
                />
              </fieldset>
            ))}
          </div>
        </Editor>

        {/* ───────── 4P ───────── */}
        <Editor type="FOUR_P" meta={metaOf("FOUR_P")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["product", "price", "place", "promotion"] as const).map((k) => (
              <fieldset key={k} className="flex flex-col gap-1.5">
                <label className={lbl}>Levier</label>
                <input className={input} name={`${k}Label`} defaultValue={fourP[k].label} />
                <label className={lbl}>Rôle</label>
                <input className={input} name={`${k}Role`} defaultValue={fourP[k].role} />
                <label className={lbl}>Puces (une par ligne)</label>
                <textarea
                  className={area}
                  name={`${k}Points`}
                  defaultValue={fourP[k].points.join("\n")}
                />
              </fieldset>
            ))}
          </div>
        </Editor>

        {/* ───────── Golden Circle ───────── */}
        <Editor type="GOLDEN_CIRCLE" meta={metaOf("GOLDEN_CIRCLE")}>
          <div className="flex flex-col gap-3">
            {(
              [
                ["why", "Why — pourquoi"],
                ["how", "How — comment"],
                ["what", "What — quoi"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1.5">
                <span className={lbl}>{label}</span>
                <textarea className={area} name={k} defaultValue={golden[k]} />
              </label>
            ))}
          </div>
        </Editor>

        {/* ───────── Ikigai ───────── */}
        <Editor type="IKIGAI" meta={metaOf("IKIGAI")}>
          <div className="flex flex-col gap-3">
            {(
              [
                ["love", "Ce que j'aime"],
                ["good", "Ce où je suis bon"],
                ["world", "Ce dont le monde a besoin"],
                ["paid", "Ce pour quoi on me paie"],
                ["center", "★ Ikigai (synthèse, au centre)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1.5">
                <span className={lbl}>{label}</span>
                <textarea className={area} name={k} defaultValue={ikigai[k]} />
              </label>
            ))}
          </div>
        </Editor>
      </div>
    </PageContainer>
  );
}

/** Shared editor card: title/order/visibility header + body + save/delete. */
function Editor({
  type,
  meta,
  children,
}: {
  type: AnalysisType;
  meta: { title: string; order: number; isVisible: boolean };
  children: React.ReactNode;
}) {
  // The card is a plain <div> holding two SIBLING forms (never nested — nested
  // <form> is invalid HTML / hydration error): the delete form in the header,
  // and the main upsert form below.
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-accent">
          {ANALYSIS_TYPE_LABELS[type]}
        </span>
        <form action={deleteAnalysisAction}>
          <input type="hidden" name="type" value={type} />
          <ConfirmSubmitButton label="Réinitialiser" />
        </form>
      </div>

      <form action={upsertAnalysisAction} className="flex flex-col gap-4">
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className={lbl}>Titre</span>
            <input
              className={input}
              name="title"
              defaultValue={meta.title}
              placeholder="ex. Mon profil"
            />
          </label>
          <label className="flex w-20 flex-col gap-1">
            <span className={lbl}>Ordre</span>
            <input className={input} name="order" type="number" min={0} defaultValue={meta.order} />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink-2">
            <input type="checkbox" name="isVisible" defaultChecked={meta.isVisible} /> Visible
          </label>
        </div>

        {children}

        <button
          type="submit"
          className="self-start rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
