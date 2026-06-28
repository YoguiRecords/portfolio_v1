import type { MetricsData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** METRICS block: perf / SEO / a11y scores as stat-cards. */
export function MetricsBlock({ data }: { data: MetricsData }) {
  return (
    <div className={styles.stats}>
      {data.scores.map((score, i) => (
        <div key={`${score.label}-${i}`} className={styles.stat}>
          <div className={styles.n}>{score.value}</div>
          <div className={styles.l}>{score.label}</div>
        </div>
      ))}
    </div>
  );
}
