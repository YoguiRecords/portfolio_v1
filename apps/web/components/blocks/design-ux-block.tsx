import type { DesignUxData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** DESIGN_UX block: design tokens / typography / journey, as label → value rows. */
export function DesignUxBlock({ data }: { data: DesignUxData }) {
  return (
    <div className={styles.rows}>
      {data.items.map((item, i) => (
        <div key={`${item.label}-${i}`} className={styles.row}>
          <span className={styles.f}>{item.label}</span>
          {item.value ? <span className={styles.d}>{item.value}</span> : null}
        </div>
      ))}
    </div>
  );
}
