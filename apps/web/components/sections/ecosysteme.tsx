import type { CSSProperties } from "react";
import type { HomeData } from "../../lib/data/home";

type Section = HomeData["sections"][number];

/** Position (top/left in %) of node `i` of `total` evenly spread on a circle. */
function orbitPosition(i: number, total: number, radius: number): CSSProperties {
  const angle = (i / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  return {
    top: `${50 + radius * Math.sin(angle)}%`,
    left: `${50 + radius * Math.cos(angle)}%`,
  };
}

/**
 * Écosystème chapter: an orbit with "me" at the core, projects on the outer
 * ring (linking to the projects section) and skills on the inner ring.
 */
export function Ecosysteme({
  section,
  skills,
  projects,
}: {
  section: Section;
  skills: HomeData["skills"];
  projects: HomeData["projects"];
}) {
  return (
    <section className="chapter" id="eco">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="eco reveal">
          <div className="stage">
            <div className="ring r1" />
            <div className="ring r2" />
            <div className="core">
              <b>YOHAN</b>
              <small>VISION × EXÉCUTION</small>
            </div>

            <div className="layer outer">
              {projects.map((p, i) => (
                <div key={p.id} className="node" style={orbitPosition(i, projects.length, 50)}>
                  <a className="chip" href="#work">
                    <div className="planet">
                      <span className="dot" />
                      <span className="lbl">
                        {p.title}
                        {p.featured ? <small>PROJET PHARE</small> : null}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            <div className="layer inner">
              {skills.map((s, i) => (
                <div key={s.id} className="node" style={orbitPosition(i, skills.length, 50)}>
                  <div className="chip">
                    <div className="planet skill">
                      <span className="dot" />
                      <span className="lbl">{s.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="legend">
            <b>Anneau interne</b> : mes compétences. <b>Anneau externe</b> : mes projets
            (cliquables → la preuve).
          </p>
        </div>
      </div>
    </section>
  );
}
