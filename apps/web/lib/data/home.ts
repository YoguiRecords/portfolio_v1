import { cache } from "react";
import { localize, type FieldTranslation } from "@portfolio/core";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";

/**
 * Loads everything the public home page needs in one grouped round-trip.
 *
 * Read-only (the public `app_web` role): every list is filtered to its public
 * state (`PUBLISHED`, `isVisible`) and ordered. Projects use an explicit
 * `select` to avoid over-fetching.
 *
 * @param prisma - a Prisma client (injected so tests can use the test DB).
 * @param locale - active locale; for non-FR the EN overlay is applied (fallback FR).
 */
export async function getHomeData(prisma: PrismaClient, locale = "fr") {
  const [
    profile,
    sections,
    kpis,
    skills,
    tracks,
    goals,
    analyses,
    projects,
    settings,
  ] = await Promise.all([
    prisma.profile.findFirst({
      include: { socials: { orderBy: { order: "asc" } }, avatar: true },
    }),
    prisma.homeSection.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
    prisma.kpi.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.careerTrack.findMany({
      orderBy: { order: "asc" },
      include: { milestones: { orderBy: { order: "asc" } } },
    }),
    prisma.careerGoal.findMany({ orderBy: { order: "asc" } }),
    prisma.analysis.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        type: true,
        featured: true,
        technologies: { select: { name: true } },
      },
    }),
    prisma.siteSettings.findFirst(),
  ]);
  if (locale === "fr") {
    return { profile, sections, kpis, skills, tracks, goals, analyses, projects, settings };
  }

  // EN overlay: load the translations for the profile + home sections and apply
  // them with a FR fallback (untranslated fields stay FR).
  const sectionIds = sections.map((s) => s.id);
  const translations = await prisma.translation.findMany({
    where: {
      locale,
      OR: [
        ...(profile ? [{ model: "Profile", recordId: profile.id }] : []),
        { model: "HomeSection", recordId: { in: sectionIds } },
      ],
    },
    select: { recordId: true, field: true, locale: true, value: true },
  });
  const byRecord = (id: string): FieldTranslation[] =>
    translations.filter((t) => t.recordId === id);

  const localizedProfile = profile
    ? localize(profile, byRecord(profile.id), locale, [
        "headline",
        "bio",
        "aiSummary",
        "availabilityLabel",
        "currentRole",
        "sigText",
      ])
    : null;
  const localizedSections = sections.map((s) =>
    localize(s, byRecord(s.id), locale, ["navLabel", "eyebrow", "title", "intro", "ctaLabel"]),
  );

  return {
    profile: localizedProfile,
    sections: localizedSections,
    kpis,
    skills,
    tracks,
    goals,
    analyses,
    projects,
    settings,
  };
}

/** The home payload type, derived from the loader. */
export type HomeData = Awaited<ReturnType<typeof getHomeData>>;

/**
 * Request-cached home loader bound to the shared client (used by pages/layout).
 * `cache()` dedupes the query when both layout and page request it for a locale.
 */
export const getHome = cache((locale: string) => getHomeData(sharedPrisma, locale));
