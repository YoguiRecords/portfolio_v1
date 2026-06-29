import type { ResultsData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** RESULTS block: outcome stat-cards (big gilded numbers). */
export function ResultsBlock({ data }: { data: ResultsData }) {
  return (
    <div className={styles.stats}>
      {data.stats.map((stat, i) => (
        <div key={`${stat.label}-${i}`} className={styles.stat}>
          <div className={styles.n}>{stat.value}</div>
          <div className={styles.l}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
