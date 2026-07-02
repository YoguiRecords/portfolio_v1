import type { HomeData } from "../../lib/data/home";
import {
  parseAnalysis,
  type SwotDataType,
  type FourPDataType,
  type GoldenCircleDataType,
  type IkigaiDataType,
} from "@portfolio/core";

type Section = HomeData["sections"][number];
type Analysis = HomeData["analyses"][number];

/** SWOT — quadrant of tinted tiles with S/W/O/T badges (validated design "B"). */
function SwotBlock({ title, data }: { title: string | null; data: SwotDataType }) {
  const quadrants = [
    { k: "s", badge: "S", q: data.strengths },
    { k: "w", badge: "W", q: data.weaknesses },
    { k: "o", badge: "O", q: data.opportunities },
    { k: "t", badge: "T", q: data.threats },
  ] as const;
  return (
    <div className="block reveal">
      <div className="ftitle">
        <span className="t mono">SWOT</span>
        <h3>{title ?? "Mon profil"}</h3>
      </div>
      <div className="swotile">
        {quadrants.map(({ k, badge, q }) => (
          <div key={k} className={`st ${k}`}>
            <div className="sh">
              <b>{badge}</b>
              <span>{q.label}</span>
            </div>
            <ul>
              {q.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 4P — four "open" editorial columns (validated design "4P-2"). */
function FourPBlock({ title, data }: { title: string | null; data: FourPDataType }) {
  const levers = [
    { n: "01", lever: data.product },
    { n: "02", lever: data.price },
    { n: "03", lever: data.place },
    { n: "04", lever: data.promotion },
  ] as const;
  return (
    <div className="block reveal">
      <div className="ftitle">
        <span className="t mono">MIX 4P</span>
        <h3>{title ?? "Mon positionnement"}</h3>
      </div>
      <div className="strips">
        {levers.map(({ n, lever }) => (
          <div key={n} className="strip">
            <div className="n">{n}</div>
            <b>{lever.label}</b>
            <div className="role">{lever.role}</div>
            <ul>
              {lever.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Golden Circle — statements left, animated radar right (validated "GC-2b"). */
function GoldenBlock({ title, data }: { title: string | null; data: GoldenCircleDataType }) {
  return (
    <div className="block reveal">
      <div className="ftitle">
        <span className="t mono">GOLDEN CIRCLE</span>
        <h3>{title ?? "Ma raison d'être"}</h3>
      </div>
      <div className="gradar rev">
        <div className="gstmt">
          <div className="gl">
            <div className="lab">
              Why <span className="en">· pourquoi</span>
            </div>
            <p>{data.why}</p>
          </div>
          <div className="gl">
            <div className="lab">
              How <span className="en">· comment</span>
            </div>
            <p>{data.how}</p>
          </div>
          <div className="gl">
            <div className="lab">
              What <span className="en">· quoi</span>
            </div>
            <p>{data.what}</p>
          </div>
        </div>
        <div className="radar" aria-hidden="true">
          <span className="grid" />
          <span className="sweep" />
          <span className="ping" />
          <span className="ping p2" />
          <span className="rl outer">What</span>
          <span className="rl mid">How</span>
          <span className="core">Why</span>
        </div>
      </div>
    </div>
  );
}

/** Ikigai — four zones converging onto the centre (validated design "IK-5"). */
function IkigaiBlock({ title, data }: { title: string | null; data: IkigaiDataType }) {
  return (
    <div className="block reveal">
      <div className="ftitle">
        <span className="t mono">IKIGAI</span>
        <h3>{title ?? "Mon équilibre"}</h3>
      </div>
      <div className="converge">
        <div className="cv2 n">
          <div className="il">Ce que j&apos;aime</div>
          <p>{data.love}</p>
        </div>
        <div className="cv2 w">
          <div className="il">Ce où je suis bon</div>
          <p>{data.good}</p>
        </div>
        <div className="cv2 c">
          <span className="ar pn">▼</span>
          <span className="ar pw">▶</span>
          <span className="ar pe">◀</span>
          <span className="ar ps">▲</span>
          <div className="cl">★ Ikigai</div>
          <div className="cv3">{data.center}</div>
        </div>
        <div className="cv2 e">
          <div className="il">Ce dont le monde a besoin</div>
          <p>{data.world}</p>
        </div>
        <div className="cv2 s">
          <div className="il">Ce pour quoi on me paie</div>
          <p>{data.paid}</p>
        </div>
      </div>
    </div>
  );
}

/** Renders one analysis from its validated JSON payload (fail-safe: skips bad data). */
function AnalysisBlock({ analysis }: { analysis: Analysis }) {
  const parsed = parseAnalysis(analysis.type, analysis.data);
  if (!parsed) return null;
  switch (parsed.type) {
    case "SWOT":
      return <SwotBlock title={analysis.title} data={parsed.data} />;
    case "FOUR_P":
      return <FourPBlock title={analysis.title} data={parsed.data} />;
    case "GOLDEN_CIRCLE":
      return <GoldenBlock title={analysis.title} data={parsed.data} />;
    case "IKIGAI":
      return <IkigaiBlock title={analysis.title} data={parsed.data} />;
  }
}

/**
 * Profil chapter: lede, KPI stat-cards, and the four strategic frameworks
 * applied to the human profile (SWOT / 4P / Golden Circle / Ikigai), each
 * rendered from its `Analysis.data` JSON payload.
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

          {analyses.map((a) => (
            <AnalysisBlock key={a.id} analysis={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
