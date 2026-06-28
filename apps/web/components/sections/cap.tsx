import type { HomeData } from "../../lib/data/home";

type Section = HomeData["sections"][number];
type Goal = HomeData["goals"][number];

/** Maps a goal status to its list-item class and short label. */
function goalView(status: Goal["status"]): { cls: string; label: string; done: boolean } {
  switch (status) {
    case "ACHIEVED":
      return { cls: "is-done", label: "Acquis", done: true };
    case "IN_PROGRESS":
      return { cls: "is-now", label: "En cours", done: false };
    case "TARGET":
      return { cls: "is-next", label: "Cible", done: false };
    case "HORIZON":
    default:
      return { cls: "is-far", label: "Horizon", done: false };
  }
}

/** Cap chapter: career goals as a checked list, with an achieved/total counter. */
export function Cap({
  section,
  goals,
}: {
  section: Section;
  goals: HomeData["goals"];
}) {
  const achieved = goals.filter((g) => g.status === "ACHIEVED").length;
  const total = goals.length;

  return (
    <section className="chapter" id="goals">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="obj reveal">
          <div className="obj-head">
            <span className="t">Objectifs de carrière</span>
            <span className="c">
              {String(achieved).padStart(2, "0")} / {String(total).padStart(2, "0")} atteints
            </span>
          </div>
          <ul>
            {goals.map((g) => {
              const v = goalView(g.status);
              return (
                <li key={g.id} className={v.cls}>
                  <span className="box" />
                  <span className="role">{g.role}</span>
                  <span className="stt">{v.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
