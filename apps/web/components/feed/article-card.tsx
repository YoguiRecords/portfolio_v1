import Link from "next/link";
import type { ArticleListItem } from "../../lib/data/news";
import { formatDate } from "../../lib/format";
import styles from "./feed.module.css";

/** A news article teaser card linking to its detail page. */
export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link href={`/actus/${article.slug}`} className={styles.card}>
      {article.cover ? (
        <div className={styles.thumb}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external MinIO URL */}
          <img src={article.cover.url} alt={article.cover.alt ?? ""} loading="lazy" />
        </div>
      ) : null}
      <div className={styles.body}>
        <span className={styles.date}>{formatDate(article.publishedAt)}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        {article.tags.length > 0 ? (
          <div className={styles.tags}>
            {article.tags.slice(0, 3).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
