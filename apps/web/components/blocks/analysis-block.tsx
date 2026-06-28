import type { AnalysisData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** ANALYSIS block: a SWOT/PESTEL/PORTER grid applied to the project. */
export function AnalysisBlock({ data }: { data: AnalysisData }) {
  return (
    <div className={styles.rows}>
      {data.items.map((item, i) => (
        <div key={`${item.groupLabel}-${i}`} className={styles.row}>
          <span className={styles.f}>{item.groupLabel}</span>
          <span className={styles.d}>{item.verdict ?? item.text}</span>
        </div>
      ))}
    </div>
  );
}
