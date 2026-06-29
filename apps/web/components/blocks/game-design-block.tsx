import type { GameDesignData } from "@portfolio/core";
import styles from "./blocks.module.css";

/** GAME_DESIGN block: pillars, the core loop, and the mechanics list. */
export function GameDesignBlock({ data }: { data: GameDesignData }) {
  return (
    <div>
      <div className={styles.pillars}>
        {data.pillars.map((pillar) => (
          <div key={pillar.name} className={styles.pillar}>
            <b>{pillar.name}</b>
            <p>{pillar.desc}</p>
          </div>
        ))}
      </div>
      <div className={styles.loop}>
        {data.coreLoop.map((step, i) => (
          <span key={step}>
            {step}
            {i < data.coreLoop.length - 1 ? <em className={styles.arrow}> → </em> : null}
          </span>
        ))}
      </div>
      <div className={styles.chips}>
        {data.mechanics.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
