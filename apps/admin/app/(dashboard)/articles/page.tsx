import { prisma } from "@portfolio/db";
import { listArticles } from "@/lib/content/article";
import { createArticleAction, deleteArticleAction } from "@/lib/actions/article-actions";
import { ArticlesList, type ArticleRow } from "@/components/articles/articles-list";

export const dynamic = "force-dynamic";

/** Liste Articles v2 (DataTable CRUD : recherche, filtres statut, suppression confirmée). */
export default async function ArticlesPage() {
  const articles = await listArticles(prisma);
  const rows: ArticleRow[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    scheduledAtLabel: a.scheduledAt
      ? a.scheduledAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
      : null,
    tagCount: a.tags.length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Articles</h1>
      <ArticlesList articles={rows} actions={{ create: createArticleAction, remove: deleteArticleAction }} />
    </div>
  );
}
