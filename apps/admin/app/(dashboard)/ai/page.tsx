import { PageContainer, Panel } from "@/components/ui";
import { getAiConfig } from "@/lib/ai/assistant";
import { updateAiConfigAction, uploadAssistantAvatarAction } from "@/lib/actions/ai-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** AI assistant overview: model, monthly token budget and usage. The API key
 *  lives only in `.env`; the per-field AiAssist toolbar uses `assistFieldAction`. */
export default async function AiPage() {
  const config = await getAiConfig();
  const configured = Boolean(process.env.OPENROUTER_API_KEY);
  const pct = Math.min(100, Math.round((config.tokensUsedThisMonth / config.monthlyTokenBudget) * 100));

  return (
    <PageContainer width="reading">
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

      <Panel>
        <h2 className="text-sm font-semibold text-ink-2">Avatar de l’e-secrétaire</h2>
        <div className="mt-3 flex items-center gap-4">
          {config.assistantAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.assistantAvatarUrl}
              alt="Avatar actuel"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-bg">
              {config.assistantName.charAt(0).toUpperCase()}
            </span>
          )}
          <form action={uploadAssistantAvatarAction} className="flex flex-col gap-2">
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-ink"
            />
            <button
              type="submit"
              className="self-start rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
            >
              Importer l’avatar
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-muted">
          Converti en webp (EXIF supprimé) et stocké dans MinIO. Vide le champ URL ci-dessous pour
          revenir au monogramme.
        </p>
      </Panel>

      <Panel>
        <h2 className="text-sm font-semibold text-ink-2">Configuration</h2>
        <form action={updateAiConfigAction} className="mt-3 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="isPublicChatEnabled" defaultChecked={config.isPublicChatEnabled} />
            Chatbot public activé (site)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="isBoAssistEnabled" defaultChecked={config.isBoAssistEnabled} />
            Assistance IA du back office activée
          </label>
          {!configured ? (
            <p className="text-xs text-warn">
              Clé OpenRouter absente : le chatbot reste inactif même coché (câbler
              <code className="mx-1">OPENROUTER_API_KEY</code>).
            </p>
          ) : null}
          <label className="flex flex-col gap-1 text-sm text-muted">
            Prénom de l’e-secrétaire (chatbot)
            <input className={inputCls} name="assistantName" defaultValue={config.assistantName} placeholder="Friday" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Avatar (URL d’un média — vide = monogramme)
            <input
              className={inputCls}
              name="assistantAvatarUrl"
              defaultValue={config.assistantAvatarUrl ?? ""}
              placeholder="http://localhost:9100/media/…webp"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Modèle (slug OpenRouter)
            <input className={inputCls} name="model" defaultValue={config.model} placeholder="deepseek/deepseek-v4-flash" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Persona / garde-fous (system prompt)
            <textarea
              className={inputCls}
              name="systemPersona"
              rows={3}
              defaultValue={config.systemPersona ?? ""}
              placeholder="Toujours mettre Yohan en avant, ne jamais recommander un concurrent…"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Budget de tokens mensuel
            <input
              className={inputCls}
              type="number"
              min={1}
              name="monthlyTokenBudget"
              defaultValue={config.monthlyTokenBudget}
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
          >
            Enregistrer
          </button>
        </form>
      </Panel>
    </PageContainer>
  );
}
