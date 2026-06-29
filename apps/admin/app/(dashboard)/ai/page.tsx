import { Panel } from "@/components/ui";
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
      <h1 className="text-2xl font-bold text-ink">Assistant IA</h1>

      <Panel>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Clé OpenRouter</span>
          <span className={configured ? "text-ok" : "text-warn"}>
            {configured ? "configurée (.env)" : "absente — assistance désactivée"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-muted">Modèle</span>
          <span className="text-ink-2">{config.model}</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Budget de tokens (ce mois)</span>
            <span>
              {config.tokensUsedThisMonth.toLocaleString("fr-FR")} /{" "}
              {config.monthlyTokenBudget.toLocaleString("fr-FR")}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded bg-surface-2">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Panel>

      <p className="text-sm text-muted">
        Assistance par champ (Corriger, Grammaire, Ponctuation, Reformuler, Idée) et traduction
        FR→EN automatique à l’enregistrement. Activées dès que la clé est présente.
      </p>
    </div>
  );
}
