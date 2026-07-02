import { prisma } from "@portfolio/db";

export const dynamic = "force-dynamic";

/** Absolute URL on the public site (env-driven, never hardcoded). */
function absolute(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
  return `${base}${path}`;
}

/**
 * Serves `/llms.txt` (plain-text presentation for AI engines, llmstxt.org
 * format: H1 + blockquote + H2 link sections). The intro comes from
 * `SiteSettings.llmsTxt` (BO-editable) or a profile-derived fallback; the link
 * sections are always generated from the published content so the file stays
 * navigable for agents.
 */
export async function GET(): Promise<Response> {
  const [settings, profile, projects] = await Promise.all([
    prisma.siteSettings.findFirst({ select: { llmsTxt: true, siteName: true } }),
    prisma.profile.findFirst({ select: { fullName: true, headline: true, aiSummary: true } }),
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { slug: true, title: true, summary: true },
    }),
  ]);

  const name = profile?.fullName ?? settings?.siteName ?? "Portfolio";
  const intro =
    settings?.llmsTxt?.trim() ||
    [`# ${name}`, profile?.headline ? `> ${profile.headline}` : "", profile?.aiSummary ?? ""]
      .filter(Boolean)
      .join("\n\n");

  const sections = [
    "## Pages",
    `- [Accueil](${absolute("/")}): profil, écosystème, parcours, objectifs et projets de ${name}`,
    `- [CV](${absolute("/cv")}): CV complet (expériences, formations, compétences) + PDF téléchargeable`,
    `- [Actualités](${absolute("/actus")}): articles et actualités`,
    `- [Agenda](${absolute("/agenda")}): évènements à venir`,
    `- [Témoignages](${absolute("/temoignages")}): avis de collaborateurs et clients`,
    `- [FAQ](${absolute("/faq")}): questions fréquentes (disponibilité, méthode)`,
    `- [Contact](${absolute("/contact")}): formulaire de contact et demande de rendez-vous`,
    ...(projects.length
      ? [
          "",
          "## Projets",
          ...projects.map(
            (p) => `- [${p.title}](${absolute(`/projets/${p.slug}`)})${p.summary ? `: ${p.summary}` : ""}`,
          ),
        ]
      : []),
  ].join("\n");

  return new Response(`${intro}\n\n${sections}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
