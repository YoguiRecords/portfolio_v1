import { getAiConfig } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

/** AI assistant overview: model, monthly token budget and usage. The API key
 *  lives only in `.env`; the per-field AiAssist toolbar uses `assistFieldAction`. */
export default async function AiPage() {
  const config = await getAiConfig();
  const configured = Boolean(process.env.OPENROUTER_API_KEY);
  const pct = Math.min(100, Math.round((config.tokensUsedThisMonth / config.monthlyTokenBudget) * 100));

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-50">Assistant IA</h1>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Clé OpenRouter</span>
          <span className={configured ? "text-green-400" : "text-amber-400"}>
            {configured ? "configurée (.env)" : "absente — assistance désactivée"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-zinc-400">Modèle</span>
          <span className="text-zinc-200">{config.model}</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Budget de tokens (ce mois)</span>
            <span>
              {config.tokensUsedThisMonth.toLocaleString("fr-FR")} /{" "}
              {config.monthlyTokenBudget.toLocaleString("fr-FR")}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded bg-zinc-800">
            <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        Assistance par champ (Corriger, Grammaire, Ponctuation, Reformuler, Idée) et traduction
        FR→EN automatique à l&apos;enregistrement. Activées dès que la clé est présente.
      </p>
    </div>
  );
}
