import { prisma } from "@portfolio/db";
import { listFaqs } from "@/lib/content/faq";
import { createFaqAction, deleteFaqAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

const SCOPES = ["GLOBAL", "HOME", "PROJECT", "ARTICLE"] as const;

/** FAQ editor (global / home / scoped entries). */
export default async function FaqPage() {
  const faqs = await listFaqs(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">FAQ</h1>

      <ul className="flex flex-col gap-3">
        {faqs.length === 0 ? (
          <li className="text-sm text-zinc-500">Aucune entrée.</li>
        ) : (
          faqs.map((f) => (
            <li key={f.id} className="flex flex-col gap-1 rounded-lg border border-zinc-800 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-100">{f.question}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase text-amber-400">{f.scope}</span>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800">
                      ✕
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-sm text-zinc-400">{f.answer}</p>
            </li>
          ))
        )}
      </ul>

      <form action={createFaqAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Ajouter une question</h2>
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
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input type="checkbox" name="isVisible" defaultChecked /> Visible
          </label>
        </div>
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Ajouter
        </button>
      </form>
    </div>
  );
}
