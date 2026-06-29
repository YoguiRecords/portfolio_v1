import type { Metadata } from "next";
import { getArticles } from "../../../lib/data/news";
import { ArticleCard } from "../../../components/feed/article-card";
import styles from "../../../components/feed/feed.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les dernières actualités et publications.",
};

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articles = await getArticles(locale);
  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">Actus</div>
        <h2>Ce qui bouge.</h2>
        {articles.length === 0 ? (
          <p className="txt">Aucune actualité pour le moment.</p>
        ) : (
          <div className={styles.list}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
