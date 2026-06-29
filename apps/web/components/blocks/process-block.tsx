import type { ProcessData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** Time-axis ticks (percentage of the project timeline). */
const TICKS = [0, 25, 50, 75, 100];

/**
 * PROCESS block: a real Gantt chart — a left task column, a shared time axis with
 * a vertical grid, and one positioned bar per phase (start% → start+width%).
 */
export function ProcessBlock({ data }: { data: ProcessData }) {
  return (
    <div className={styles.gantt}>
      <div className={styles.ganttAxis}>
        <span />
        <div className={styles.ganttScale}>
          {TICKS.map((t) => (
            <span key={t} className={styles.tickLabel} style={{ left: `${t}%` }}>
              {t === 0 ? "Début" : t === 100 ? "Livraison" : `${t}%`}
            </span>
          ))}
        </div>
      </div>

      {data.phases.map((phase, i) => (
        <div key={`${phase.label}-${i}`} className={styles.ganttRow}>
          <div className={styles.ganttLabel}>{phase.label}</div>
          <div className={styles.track}>
            <div
              className={`${styles.bar}${phase.style ? ` ${styles[phase.style]}` : ""}`}
              style={{ left: `${phase.start}%`, width: `${phase.width}%` }}
              title={`${phase.label} · ${phase.start}% → ${phase.start + phase.width}%`}
            >
              {phase.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
