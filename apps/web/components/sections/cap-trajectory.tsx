"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { computeLayout, type GoalLike, type Layout } from "../../lib/cap-geometry";
import styles from "./cap-trajectory.module.css";

/** Étoiles décoratives déterministes (pas de Math.random → SSR stable). */
function StarField({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const x = (i * 53) % 100;
    const y = (i * 29) % 100;
    const sz = 0.6 + ((i * 7) % 16) / 10;
    const o = 0.18 + ((i * 11) % 50) / 100;
    const gold = i % 5 === 0;
    return (
      <span
        key={i}
        style={
          {
            left: `${x}%`,
            top: `${y}%`,
            width: `${sz}px`,
            height: `${sz}px`,
            opacity: o,
            animationDelay: `${(i % 40) / 10}s`,
            ["--o" as string]: o,
            ...(gold ? { background: "var(--accent)" } : {}),
          } as CSSProperties
        }
      />
    );
  });
  return (
    <div className={styles.stars} aria-hidden>
      {stars}
    </div>
  );
}

function kindClass(kind: string): string {
  return styles[kind] ?? "";
}

/** Rend un graphe (desktop horizontal ou mobile vertical) à partir d'un Layout. */
function Chart({ layout, variant }: { layout: Layout; variant: "chart" | "mchart" }) {
  const { nodes, solidPath, dashedPath, areaPath, viewBox } = layout;
  const idp = variant; // suffixe d'id de gradient unique par variante
  return (
    <>
      <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient
            id={`ln-${idp}`}
            x1="0"
            y1={variant === "mchart" ? "1" : "0"}
            x2={variant === "mchart" ? "0" : "1"}
            y2="0"
          >
            <stop offset="0" stopColor="#9a6000" />
            <stop offset="1" stopColor="#f0a800" />
          </linearGradient>
          {areaPath ? (
            <linearGradient id={`ar-${idp}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(240,168,0,.24)" />
              <stop offset="1" stopColor="rgba(240,168,0,0)" />
            </linearGradient>
          ) : null}
        </defs>
        {areaPath ? <path className={styles.area} d={areaPath} fill={`url(#ar-${idp})`} /> : null}
        {dashedPath ? (
          <path
            d={dashedPath}
            fill="none"
            stroke="#3a3d41"
            strokeWidth="2"
            strokeDasharray="1 8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {solidPath ? (
          <>
            <path
              d={solidPath}
              fill="none"
              stroke="rgba(240,168,0,.16)"
              strokeWidth="11"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={solidPath}
              fill="none"
              stroke={`url(#ln-${idp})`}
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {nodes.map((nd) => (
          <li
            key={nd.goal.id}
            className={`${styles.node} ${kindClass(nd.view.kind)} ${nd.isDest ? styles.dest : ""}`}
            style={
              {
                left: `${nd.leftPct}%`,
                top: `${nd.topPct}%`,
                ["--d" as string]: `${nd.delay}s`,
              } as CSSProperties
            }
          >
            <span className={styles.dot} aria-hidden>
              <svg className={styles.check} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {nd.view.kind === "now" ? (
              <>
                <span className={styles.ping} aria-hidden />
                <span className={`${styles.ping} ${styles.p2}`} aria-hidden />
                <span className={styles.here} aria-hidden>
                  ▲ Vous êtes ici
                </span>
              </>
            ) : null}
            {nd.view.kind === "next" || nd.view.kind === "far" ? (
              <span className={styles.beacon} aria-hidden />
            ) : null}
            {nd.isDest ? (
              <>
                <span className={styles.spark} aria-hidden />
                <span className={styles.ring} aria-hidden />
                <span className={`${styles.ring} ${styles.r2}`} aria-hidden />
              </>
            ) : null}
            <span className={styles.label}>
              <span className={styles.name}>{nd.goal.role}</span>
              <span className={styles.tag}>{nd.view.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Trajectoire de carrière « Le cap ».
 * Desktop : courbe horizontale ascendante. Mobile : trajectoire verticale dans un
 * sticky-pin (le bloc se fige le temps de l'anim, puis on continue de scroller).
 * Reveal auto au bon seuil de visibilité ; respecte prefers-reduced-motion.
 */
export function CapTrajectory({ goals }: { goals: GoalLike[] }) {
  const desktop = computeLayout(goals, "horizontal");
  const mobile = computeLayout(goals, "vertical");
  const chartRef = useRef<HTMLDivElement>(null);
  const mchartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [chartRef.current, mchartRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Fallback (reduced motion, ou environnement sans IntersectionObserver) : tout afficher.
    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add(styles.play));
      return;
    }
    const observers = targets.map((el) => {
      const ratio = el === mchartRef.current ? 0.85 : 0.35; // mobile : quasi plein écran
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (
              e.isIntersecting &&
              e.intersectionRatio >= ratio &&
              (e.target as HTMLElement).offsetParent !== null
            ) {
              e.target.classList.add(styles.play);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: [ratio] },
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Desktop */}
      <div className={styles.chart} ref={chartRef}>
        <StarField count={70} />
        <Chart layout={desktop} variant="chart" />
      </div>
      <div className={styles.axis}>
        <span>Départ</span>
        <span>Le cap →</span>
      </div>

      {/* Mobile : sticky-pin */}
      <div className={styles.track}>
        <div className={styles.pin}>
          <div className={styles.mchart} ref={mchartRef}>
            <StarField count={55} />
            <Chart layout={mobile} variant="mchart" />
          </div>
        </div>
      </div>
    </div>
  );
}
