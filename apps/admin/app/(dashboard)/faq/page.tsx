import { prisma } from "@portfolio/db";
import { Button, ConfirmSubmitButton } from "@/components/ui";
import { listFaqs } from "@/lib/content/faq";
import { createFaqAction, deleteFaqAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

const SCOPES = ["GLOBAL", "HOME", "PROJECT", "ARTICLE"] as const;

/** FAQ editor (global / home / scoped entries). */
export default async function FaqPage() {
  const faqs = await listFaqs(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink">FAQ</h1>

      <ul className="flex flex-col gap-3">
        {faqs.length === 0 ? (
          <li className="text-sm text-muted">Aucune entrée.</li>
        ) : (
          faqs.map((f) => (
            <li key={f.id} className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">{f.question}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase text-accent">{f.scope}</span>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <ConfirmSubmitButton label="✕" />
                  </form>
                </div>
              </div>
              <p className="text-sm text-muted">{f.answer}</p>
            </li>
          ))
        )}
      </ul>

      <form action={createFaqAction} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink-2">Ajouter une question</h2>
        <input className={inputCls} name="question" placeholder="Question" required />
        <textarea className={inputCls} name="answer" placeholder="Réponse" rows={3} required />
        <div className="flex items-center gap-3">
          <select className={inputCls} name="scope" defaultValue="GLOBAL">
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" name="isVisible" defaultChecked /> Visible
          </label>
        </div>
        <Button variant="primary" type="submit" className="self-start">
          Ajouter
        </Button>
      </form>
    </div>
  );
}
