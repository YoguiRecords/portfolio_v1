import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "../../../../lib/data/news";
import { ArticleHeader } from "../../../../components/feed/article-header";
import { Markdown } from "../../../../components/markdown/markdown";
import { Gallery, type MediaItem } from "../../../../components/gallery/gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const media: MediaItem[] = article.media.map((m) => ({
    id: m.media.id,
    kind: m.media.kind,
    url: m.media.url,
    alt: m.media.alt,
    externalUrl: m.media.externalUrl,
    posterUrl: m.media.posterUrl,
  }));

  return (
    <main>
      <ArticleHeader article={article} />
      <div className="wrap">
        <Markdown content={article.content} />
        <Gallery items={media} />
        {article.event ? (
          <p className="txt" style={{ marginTop: 24 }}>
            → Évènement lié :{" "}
            <Link href={`/agenda/${article.event.slug}`}>{article.event.title}</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
