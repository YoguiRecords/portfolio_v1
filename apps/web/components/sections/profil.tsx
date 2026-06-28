import type { HomeData } from "../../lib/data/home";

type Section = HomeData["sections"][number];
type Analysis = HomeData["analyses"][number];

/** Groups analysis items by their `groupLabel`, preserving first-seen order. */
function groupByLabel(items: Analysis["items"]): { label: string; items: Analysis["items"] }[] {
  const groups: { label: string; items: Analysis["items"] }[] = [];
  for (const item of items) {
    let group = groups.find((g) => g.label === item.groupLabel);
    if (!group) {
      group = { label: item.groupLabel, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

function SwotBlock({ analysis }: { analysis: Analysis }) {
  const groups = groupByLabel(analysis.items);
  return (
    <div className="block reveal">
      <div className="ftitle">
        <span className="t mono">SWOT</span>
        <h4>{analysis.title ?? "Mon profil"}</h4>
      </div>
      <div className="swot">
        {groups.map((g, i) => (
          <div key={g.label} className={`q i${i}`}>
            <div className="qk">{g.label}</div>
            <ul>
              {g.items.map((it) => (
                <li key={it.id}>{it.text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerdictBlock({ analysis }: { analysis: Analysis }) {
  return (
    <div className="block">
      <div className="ftitle">
        <span className="t mono">{analysis.type}</span>
        <h4>{analysis.title ?? ""}</h4>
      </div>
      <div className="verdict">
        {analysis.items.map((it) => (
          <div key={it.id} className="vr">
            <span className="f">{it.groupLabel}</span>
            <span className="d">{it.verdict}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Profil chapter: lede, KPI stat-cards, and the SWOT / PESTEL / PORTER analysis
 * grids — all rendered from the `analyses` + `kpis` rows.
 */
export function Profil({
  section,
  kpis,
  analyses,
}: {
  section: Section;
  kpis: HomeData["kpis"];
  analyses: HomeData["analyses"];
}) {
  const swot = analyses.find((a) => a.type === "SWOT");
  const verdicts = analyses.filter((a) => a.type === "PESTEL" || a.type === "PORTER");

  return (
    <section className="chapter" id="about">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="dash">
          {kpis.length > 0 ? (
            <div className="kpis reveal">
              {kpis.map((k) => (
                <div key={k.id} className="stat">
                  <div className="k">{k.label}</div>
                  <div className="n">{k.value}</div>
                  {k.note ? (
                    <div className={`s${k.trend === "UP" ? " up" : ""}`}>
                      {k.trend === "UP" ? "▲ " : ""}
                      {k.note}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {swot ? <SwotBlock analysis={swot} /> : null}

          {verdicts.length > 0 ? (
            <div className="two reveal">
              {verdicts.map((a) => (
                <VerdictBlock key={a.id} analysis={a} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
