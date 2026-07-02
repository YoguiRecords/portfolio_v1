import { preload } from "react-dom";
import { getTranslations } from "next-intl/server";
import { Link } from "../../i18n/navigation";
import { Typewriter } from "../typewriter";
import type { HomeData } from "../../lib/data/home";

/**
 * Hero chapter: credit line, name, animated typewriter, lead (bio), signature,
 * CTAs and the duotone portrait frame. All copy comes from the Profile row.
 */
export async function Hero({
  profile,
  section,
}: {
  profile: NonNullable<HomeData["profile"]>;
  section?: HomeData["sections"][number];
}) {
  const t = await getTranslations("nav");
  // LCP element: hint the browser as early as possible (preload + high priority).
  if (profile.avatar) {
    preload(profile.avatar.url, { as: "image", fetchPriority: "high" });
  }
  const lines =
    profile.typewriterLines.length > 0 ? profile.typewriterLines : [profile.headline];
  const initials = profile.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
              {t("discover")} →
            </a>
            <Link href="/cv" className="btn btn-ghost on-dark">
              {t("cv")}
            </Link>
          </div>
        </div>
        <figure className="photoframe">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- external MinIO URL, sized by CSS
            <img
              src={profile.avatar.url}
              alt={profile.fullName}
              fetchPriority="high"
              width={profile.avatar.width ?? undefined}
              height={profile.avatar.height ?? undefined}
            />
          ) : (
            <span className="monogram" aria-hidden="true">
              {initials}
            </span>
          )}
          <span className="tone" />
          <span className="shade" />
        </figure>
      </div>
    </header>
  );
}
