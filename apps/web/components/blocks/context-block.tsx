import type { ContextData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** CONTEXT block: problem · objective · role (three columns). */
export function ContextBlock({ data }: { data: ContextData }) {
  return (
    <div className={styles.context}>
      <div>
        <div className={styles.label}>Problème</div>
        <p>{data.problem}</p>
      </div>
      <div>
        <div className={styles.label}>Objectif</div>
        <p>{data.objective}</p>
      </div>
      <div>
        <div className={styles.label}>Rôle</div>
        <p>{data.role}</p>
      </div>
    </div>
  );
}
