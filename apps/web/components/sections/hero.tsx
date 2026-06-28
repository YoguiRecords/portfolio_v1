import { Typewriter } from "../typewriter";
import type { HomeData } from "../../lib/data/home";

/**
 * Hero chapter: credit line, name, animated typewriter, lead (bio), signature,
 * CTAs and the duotone portrait frame. All copy comes from the Profile row.
 */
export function Hero({
  profile,
  section,
}: {
  profile: NonNullable<HomeData["profile"]>;
  section?: HomeData["sections"][number];
}) {
  const lines =
    profile.typewriterLines.length > 0 ? profile.typewriterLines : [profile.headline];

  return (
    <header className="hero" id="top">
      <div className="wrap">
        <div className="content">
          <div className="credit">{section?.eyebrow ?? `Un portfolio de ${profile.fullName}`}</div>
          <div className="name">{profile.fullName} —</div>
          <Typewriter lines={lines} />
          <p className="lead">{profile.bio}</p>
          {profile.sigText ? <span className="sig">{profile.sigText}</span> : null}
          <div className="cta">
            <a href="#about" className="btn btn-primary">
              Découvrir le profil →
            </a>
            <a href="/cv" className="btn btn-ghost on-dark">
              Le CV
            </a>
          </div>
        </div>
        <figure className="photoframe" aria-hidden="true">
          <span className="shade" />
        </figure>
      </div>
    </header>
  );
}
