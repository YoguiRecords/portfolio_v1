import type { CSSProperties } from "react";
import type { HomeData } from "../../lib/data/home";
import styles from "./parcours.module.css";

type Section = HomeData["sections"][number];
type Track = HomeData["tracks"][number];
type Milestone = Track["milestones"][number];

/** Vertical placement (%) of a year on the time axis (6%…84%). */
function topFor(year: number, min: number, max: number): number {
  if (max === min) return 50;
  return 6 + ((year - min) / (max - min)) * 78;
}

/** A CSS style carrying the per-lane colour (and optional track count). */
function laneStyle(color: string, extra: CSSProperties = {}): CSSProperties {
  return { ["--lane" as string]: color, ...extra } as CSSProperties;
}

interface FlatMilestone extends Milestone {
  trackName: string;
  colorHex: string;
}

/**
 * Parcours chapter: the signature animated timeline. Desktop renders four
 * parallel lanes on a shared year axis (line-grow + sweep + convergence to the
 * "today" card, fired when scrolled into view); mobile collapses to a single
 * chronological column. Fully driven by `tracks`/`milestones` (lane colours from
 * each track's `colorHex`).
 */
export function Parcours({
  section,
  tracks,
  currentRole,
  signature,
}: {
  section: Section;
  tracks: HomeData["tracks"];
  currentRole: string | null;
  signature: string | null;
}) {
  const flat: FlatMilestone[] = tracks.flatMap((t) =>
    t.milestones.map((m) => ({ ...m, trackName: t.name, colorHex: t.colorHex })),
  );
  const years = flat.map((m) => m.sortYear ?? 0).filter((y) => y > 0);
  const min = years.length ? Math.min(...years) : 0;
  const max = years.length ? Math.max(...years) : 0;
  const axisYears = Array.from(new Set(years)).sort((a, b) => a - b);

  const gridStyle = { ["--tracks" as string]: tracks.length } as CSSProperties;

  return (
    <section className="chapter" id="path">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className={styles.timeline}>
          {/* DESKTOP — axe temporel à 4 voies */}
          <div className={styles.desktop} data-tl>
            <div className={`${styles.cols} ${styles.head}`} style={gridStyle}>
              <div />
              {tracks.map((t) => (
                <div key={t.id} className={styles.laneName} style={laneStyle(t.colorHex)}>
                  <span className={styles.bar} />
                  <span className={styles.nm}>{t.name}</span>
                </div>
              ))}
            </div>

            <div className={styles.stage}>
              <div className={styles.axis}>
                {axisYears.map((y) => {
                  const top = `${topFor(y, min, max)}%`;
                  return (
                    <span key={`y-${y}`}>
                      <span className={styles.yr} style={{ top }}>
                        {y}
                      </span>
                      <span className={styles.gl} style={{ top }} />
                    </span>
                  );
                })}
              </div>

              <div className={styles.sweep} />

              <div className={styles.lanes} style={gridStyle}>
                <div />
                {tracks.map((t) => {
                  const nodes = t.milestones
                    .filter((m) => (m.sortYear ?? 0) > 0)
                    .sort((a, b) => (a.sortYear ?? 0) - (b.sortYear ?? 0));
                  const firstTop = nodes.length ? topFor(nodes[0].sortYear ?? 0, min, max) : 0;
                  return (
                    <div key={t.id} className={styles.lane} style={laneStyle(t.colorHex)}>
                      <div
                        className={styles.line}
                        style={{ top: `${firstTop}%`, height: `${100 - firstTop}%` }}
                      />
                      {nodes.map((m) => (
                        <div
                          key={m.id}
                          className={styles.node}
                          style={{ top: `${topFor(m.sortYear ?? 0, min, max)}%` }}
                        >
                          <span className={styles.dot} />
                          <div className={styles.card}>
                            <div className={styles.yr2}>{m.dateLabel}</div>
                            <div className={styles.role}>{m.role}</div>
                            {m.description ? <div className={styles.desc}>{m.description}</div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.conv}>
              <div className={styles.mergebar} />
              <div className={styles.drop} />
              {currentRole ? (
                <div className={styles.todayCard}>
                  <span className={styles.todayLbl}>Aujourd&apos;hui · vous êtes ici</span>
                  <div className={styles.todayRole}>{currentRole}</div>
                  <p>
                    Quatre voies réunies dans la même main : vision business, management
                    d&apos;équipe, pédagogie et exécution technique.
                  </p>
                  {signature ? <span className={styles.tsig}>{signature}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* MOBILE — chronologique */}
          <div className={styles.mobile} data-tl>
            <div className={styles.m7}>
              {flat
                .slice()
                .sort((a, b) => (a.sortYear ?? 0) - (b.sortYear ?? 0))
                .map((m) => (
                  <div key={m.id} className={styles.mev} style={laneStyle(m.colorHex)}>
                    <span className={styles.mdot} />
                    <div className={styles.mcard}>
                      <div className={styles.mtag}>
                        {m.trackName} · {m.dateLabel}
                      </div>
                      <div className={styles.role}>{m.role}</div>
                      {m.description ? <div className={styles.desc}>{m.description}</div> : null}
                    </div>
                  </div>
                ))}
              {currentRole ? (
                <div className={`${styles.mev} ${styles.now}`}>
                  <span className={styles.mdot} />
                  <div className={`${styles.mcard} ${styles.today}`}>
                    <div className={styles.mtag}>Aujourd&apos;hui · vous êtes ici</div>
                    <div className={styles.role}>{currentRole}</div>
                    <div className={styles.desc}>
                      Les quatre voies réunies : vision, management, pédagogie, exécution.
                    </div>
                    {signature ? <span className={styles.mtsig}>{signature}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
