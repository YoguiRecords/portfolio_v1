import type { CSSProperties } from "react";
import type { HomeData } from "../../lib/data/home";

type Section = HomeData["sections"][number];
type Track = HomeData["tracks"][number];

interface FlatMilestone {
  id: string;
  trackName: string;
  colorHex: string;
  dateLabel: string;
  sortYear: number;
  role: string;
  description: string | null;
}

/** Flattens milestones across all tracks into a single chronological list. */
function flatten(tracks: Track[]): FlatMilestone[] {
  return tracks
    .flatMap((t) =>
      t.milestones.map((m) => ({
        id: m.id,
        trackName: t.name,
        colorHex: t.colorHex,
        dateLabel: m.dateLabel,
        sortYear: m.sortYear ?? 0,
        role: m.role,
        description: m.description,
      })),
    )
    .sort((a, b) => a.sortYear - b.sortYear);
}

/**
 * Parcours chapter: the four career tracks merged into one chronological
 * timeline (one card per milestone, gilded per its track colour), closing on the
 * current "today" card. Animated in via the `[data-tl]` play hook.
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
  const milestones = flatten(tracks);

  return (
    <section className="chapter" id="path">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="path-tl" data-tl>
          <div className="m7">
            {milestones.map((m) => {
              const style = {
                borderLeftColor: m.colorHex,
              } as CSSProperties;
              const dotStyle = { borderColor: m.colorHex } as CSSProperties;
              return (
                <div key={m.id} className="mev">
                  <span className="mdot" style={dotStyle} />
                  <div className="mcard" style={style}>
                    <div className="mtag" style={{ color: m.colorHex }}>
                      {m.trackName} · {m.dateLabel}
                    </div>
                    <div className="role">{m.role}</div>
                    {m.description ? <div className="desc">{m.description}</div> : null}
                  </div>
                </div>
              );
            })}

            {currentRole ? (
              <div className="mev now">
                <span className="mdot" />
                <div className="mcard today">
                  <div className="mtag">Aujourd&apos;hui · vous êtes ici</div>
                  <div className="role">{currentRole}</div>
                  <div className="desc">
                    Les quatre voies réunies : vision, management, pédagogie, exécution.
                  </div>
                  {signature ? <span className="tsig">{signature}</span> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
