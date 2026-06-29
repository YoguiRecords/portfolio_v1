import { prisma } from "@portfolio/db";
import { listArticles } from "@/lib/content/article";
import { createArticleAction, deleteArticleAction } from "@/lib/actions/article-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Article editor — CRUD with scheduled publishing (status + scheduledAt). */
export default async function ArticlesPage() {
  const articles = await listArticles(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Articles</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {articles.length === 0 ? (
          <li className="p-4 text-sm text-zinc-500">Aucun article.</li>
        ) : (
          articles.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-semibold text-zinc-100">{a.title}</div>
                <div className="text-xs text-zinc-500">
                  {a.slug} · {a.status}
                  {a.scheduledAt ? ` · prévu ${a.scheduledAt.toISOString().slice(0, 16)}` : ""}
                </div>
              </div>
              <form action={deleteArticleAction}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createArticleAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Nouvelle actu</h2>
        <input className={inputCls} name="title" placeholder="Titre" required />
        <input className={inputCls} name="slug" placeholder="slug-de-l-actu" required />
        <input className={inputCls} name="excerpt" placeholder="Accroche" required />
        <input className={inputCls} name="tags" placeholder="tags séparés par des virgules" />
        <div className="flex gap-3">
          <select className={inputCls} name="status" defaultValue="DRAFT">
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Programmée</option>
            <option value="PUBLISHED">Publiée</option>
          </select>
          <input className={inputCls} name="scheduledAt" type="datetime-local" />
        </div>
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Créer
        </button>
      </form>
    </div>
  );
}
