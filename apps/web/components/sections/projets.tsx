import type { HomeData } from "../../lib/data/home";

type Section = HomeData["sections"][number];
type Project = HomeData["projects"][number];

/** Human label for a project type (drives the scene category line). */
function typeLabel(type: Project["type"]): string {
  switch (type) {
    case "GAME":
      return "Jeu / Produit";
    case "WEBSITE":
      return "Site / Web";
    case "BUSINESS":
      return "Stratégie & Business";
    case "SOFTWARE":
    default:
      return "Produit / Logiciel";
  }
}

/** Projets chapter: each published project as a clickable "scene" → its case study. */
export function Projets({
  section,
  projects,
}: {
  section: Section;
  projects: HomeData["projects"];
}) {
  return (
    <section className="chapter" id="work">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="scenes">
          {projects.map((p, i) => (
            <a key={p.id} className="scene reveal" href={`/projets/${p.slug}`}>
              <div className="cap">
                <span className="num">
                  Scène {String(i + 1).padStart(2, "0")}
                  {p.featured ? " — ★ Phare" : ""}
                </span>
                <div className="cat">{typeLabel(p.type)}</div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                {p.technologies.length > 0 ? (
                  <div className="tags">
                    {p.technologies.map((t) => (
                      <span key={t.name}>{t.name}</span>
                    ))}
                  </div>
                ) : null}
                <span className="open">Ouvrir l&apos;étude de cas →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
