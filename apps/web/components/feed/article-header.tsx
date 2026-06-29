import type { ArticleDetail } from "../../lib/data/news";
import { formatDate } from "../../lib/format";
import styles from "./feed.module.css";

/** Detail header for an article: date · reading time, title, excerpt, cover. */
export function ArticleHeader({ article }: { article: ArticleDetail }) {
  const meta = [formatDate(article.publishedAt)];
  if (article.readingMinutes) meta.push(`${article.readingMinutes} min de lecture`);

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.eyebrow}>{meta.filter(Boolean).join(" · ")}</div>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.lead}>{article.excerpt}</p>
        {article.cover ? (
          <figure className={styles.cover}>
            {/* eslint-disable-next-line @next/next/no-img-element -- external MinIO URL */}
            <img src={article.cover.url} alt={article.cover.alt ?? article.title} />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
