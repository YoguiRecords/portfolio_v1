import type { SecurityData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** SECURITY block: the security measures applied to the project. */
export function SecurityBlock({ data }: { data: SecurityData }) {
  return (
    <ul className={styles.list}>
      {data.measures.map((m, i) => (
        <li key={`${m.label}-${i}`}>
          <strong>{m.label}</strong>
          {m.detail ? ` — ${m.detail}` : ""}
        </li>
      ))}
    </ul>
  );
}
