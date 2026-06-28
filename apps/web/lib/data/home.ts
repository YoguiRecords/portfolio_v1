import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";

/**
 * Loads everything the public home page needs in one grouped round-trip.
 *
 * Read-only (the public `app_web` role): every list is filtered to its public
 * state (`PUBLISHED`, `isVisible`) and ordered. Projects use an explicit
 * `select` to avoid over-fetching.
 *
 * @param prisma - a Prisma client (injected so tests can use the test DB).
 */
export async function getHomeData(prisma: PrismaClient) {
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
  return { profile, sections, kpis, skills, tracks, goals, analyses, projects, settings };
}

/** The home payload type, derived from the loader. */
export type HomeData = Awaited<ReturnType<typeof getHomeData>>;

/**
 * Request-cached home loader bound to the shared client (used by pages/layout).
 * `cache()` dedupes the query when both layout and page request it.
 */
export const getHome = cache(() => getHomeData(sharedPrisma));
