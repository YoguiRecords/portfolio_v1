import type { ProcessData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** PROCESS block: an execution timeline (Gantt) — one positioned bar per phase. */
export function ProcessBlock({ data }: { data: ProcessData }) {
  return (
    <div className={styles.gantt}>
      {data.phases.map((phase, i) => (
        <div key={`${phase.label}-${i}`} className={styles.phaseRow}>
          <div
            className={`${styles.phaseBar}${phase.style ? ` ${styles[phase.style]}` : ""}`}
            style={{ left: `${phase.start}%`, width: `${phase.width}%` }}
          >
            {phase.label}
          </div>
        </div>
      ))}
    </div>
  );
}
