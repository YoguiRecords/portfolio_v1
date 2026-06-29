import { getHome } from "../../lib/data/home";
import { Hero } from "../../components/sections/hero";
import { Profil } from "../../components/sections/profil";
import { Ecosysteme } from "../../components/sections/ecosysteme";
import { Parcours } from "../../components/sections/parcours";
import { Cap } from "../../components/sections/cap";
import { Projets } from "../../components/sections/projets";

// Rendered per request from the database (no build-time DB dependency); the
// server still emits full HTML, so SEO is preserved.
export const dynamic = "force-dynamic";

/**
 * Public home page. Composes the chapters in the order defined by `HomeSection`
 * (hidden sections are already filtered out by the loader); a section without
 * its backing data is skipped. All content is DB-driven.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getHome(locale);
  const { profile, sections } = data;

  return (
    <main>
      {sections.map((section) => {
        switch (section.key) {
          case "hero":
            return profile ? <Hero key={section.id} profile={profile} section={section} /> : null;
          case "profil":
            return (
              <Profil
                key={section.id}
                section={section}
                kpis={data.kpis}
                analyses={data.analyses}
              />
            );
          case "ecosysteme":
            return (
              <Ecosysteme
                key={section.id}
                section={section}
                skills={data.skills}
                projects={data.projects}
              />
            );
          case "parcours":
            return (
              <Parcours
                key={section.id}
                section={section}
                tracks={data.tracks}
                currentRole={profile?.currentRole ?? null}
                signature={profile?.sigText ?? null}
              />
            );
          case "cap":
            return <Cap key={section.id} section={section} goals={data.goals} />;
          case "projets":
            return <Projets key={section.id} section={section} projects={data.projects} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
