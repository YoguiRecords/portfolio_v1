import { Markdown } from "../markdown/markdown";
import type { FaqItem } from "../../lib/data/faq";
import styles from "./faq-accordion.module.css";

/**
 * Accessible FAQ accordion built on native `<details>/<summary>` (no client JS):
 * the answers stay in the DOM, so the content is crawlable and matches the
 * `FAQPage` structured data emitted alongside it. Answers render through the
 * safe Markdown renderer.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <details className={styles.details}>
            <summary className={styles.summary}>{item.question}</summary>
            <div className={styles.answer}>
              <Markdown content={item.answer} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
