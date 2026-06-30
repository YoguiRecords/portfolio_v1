import type { HomeData } from "../../lib/data/home";
import type { GoalLike } from "../../lib/cap-geometry";
import { CapTrajectory } from "./cap-trajectory";

type Section = HomeData["sections"][number];

/** Cap chapter: career goals as an ascending cosmic trajectory + achieved/total counter. */
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

        <div className="obj-head reveal">
          <span className="t">Objectifs de carrière</span>
          <span className="c">
            {String(achieved).padStart(2, "0")} / {String(total).padStart(2, "0")} atteints
          </span>
        </div>

        <CapTrajectory goals={goals as unknown as GoalLike[]} />
      </div>
    </section>
  );
}
