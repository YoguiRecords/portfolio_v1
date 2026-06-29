import type { TextData } from "@portfolio/core";
import styles from "./blocks.module.css";

/**
 * TEXT block: free prose. The markdown is rendered as plain paragraphs (split on
 * blank lines) — never injected as raw HTML, so there is no XSS surface. A rich
 * markdown renderer lands with the articles feature.
 */
export function TextBlock({ data }: { data: TextData }) {
  const paragraphs = data.markdown.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return (
    <div className={styles.prose}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
