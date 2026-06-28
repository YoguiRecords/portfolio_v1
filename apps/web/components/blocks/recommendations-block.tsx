import type { RecommendationsData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** RECOMMENDATIONS block: prioritized recommendations + optional deliverables. */
export function RecommendationsBlock({ data }: { data: RecommendationsData }) {
  return (
    <div>
      <ul className={styles.list}>
        {data.items.map((item, i) => (
          <li key={i}>
            {item.priority ? <strong>{item.priority} — </strong> : null}
            {item.text}
          </li>
        ))}
      </ul>
      {data.deliverables && data.deliverables.length > 0 ? (
        <div className={styles.chips} style={{ marginTop: 18 }}>
          {data.deliverables.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
