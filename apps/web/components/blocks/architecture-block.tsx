import type { ArchitectureData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** ARCHITECTURE block: the system layers and the key decisions. */
export function ArchitectureBlock({ data }: { data: ArchitectureData }) {
  return (
    <div>
      <div className={styles.rows}>
        {data.layers.map((layer, i) => (
          <div key={`${layer.name}-${i}`} className={styles.row}>
            <span className={styles.f}>{layer.name}</span>
            {layer.desc ? <span className={styles.d}>{layer.desc}</span> : null}
          </div>
        ))}
      </div>
      {data.decisions && data.decisions.length > 0 ? (
        <ul className={styles.list} style={{ marginTop: 18 }}>
          {data.decisions.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
