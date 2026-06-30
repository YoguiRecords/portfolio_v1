import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { PageContainer } from "@/components/ui";
import { updateArticleAction } from "@/lib/actions/article-actions";
import { ArticleEditor, type ArticleEditorData } from "@/components/articles/article-editor";

export const dynamic = "force-dynamic";

/** Article editor v2: markdown + live preview + scheduled publishing. */
export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const editorData: ArticleEditorData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    tags: article.tags.join(", "),
    status: article.status,
    scheduledAt: article.scheduledAt ? article.scheduledAt.toISOString().slice(0, 16) : "",
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
  };

  return (
    <PageContainer width="editor" gap={8}>
      <div>
        <Link href="/articles" className="font-mono text-xs text-muted hover:text-accent">
          ← Articles
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{article.title}</h1>
      </div>
      <ArticleEditor article={editorData} action={updateArticleAction} />
    </PageContainer>
  );
}
