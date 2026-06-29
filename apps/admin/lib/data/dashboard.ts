import { prisma } from "@portfolio/db";
import { getTrafficSummary, type TrafficSummary } from "./traffic";

/** KPIs portfolio affichés en tête du dashboard. */
export interface DashboardKpis {
  projects: number;
  articles: number;
  pendingTestimonials: number;
}

/** Contenu nécessitant une action (brouillons, programmés, témoignages à valider). */
export interface ContentToTreat {
  draftProjects: number;
  draftArticles: number;
  scheduledArticles: number;
  pendingTestimonials: number;
}

/** Élément « top contenu » (publié, le plus récent en tête). */
export interface TopContentItem {
  id: string;
  title: string;
  kind: "project" | "article";
  publishedAt: Date | null;
}

/** Données agrégées du dashboard v2 (portfolio + audience). */
export interface DashboardData {
  kpis: DashboardKpis;
  traffic: TrafficSummary;
  contentToTreat: ContentToTreat;
  topContent: TopContentItem[];
}

const TOP_CONTENT_LIMIT = 5;

/** Trie des contenus par date de publication décroissante (nuls en dernier). */
function byRecentPublication(a: TopContentItem, b: TopContentItem): number {
  return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
}

/**
 * Agrège les données du dashboard (rôle `app_admin`) : KPIs, trafic (Umami avec
 * fallback), contenu à traiter et top contenus publiés. Pas d'inbox/pipeline ici
 * (réservé à Mission Control, P12).
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [
    projects,
    articles,
    pendingTestimonials,
    draftProjects,
    draftArticles,
    scheduledArticles,
    recentProjects,
    recentArticles,
    traffic,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.article.count(),
    prisma.testimonial.count({ where: { status: "PENDING" } }),
    prisma.project.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: TOP_CONTENT_LIMIT,
      select: { id: true, title: true, publishedAt: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: TOP_CONTENT_LIMIT,
      select: { id: true, title: true, publishedAt: true },
    }),
    getTrafficSummary(),
  ]);

  const topContent: TopContentItem[] = [
    ...recentProjects.map((p) => ({ ...p, kind: "project" as const })),
    ...recentArticles.map((a) => ({ ...a, kind: "article" as const })),
  ]
    .sort(byRecentPublication)
    .slice(0, TOP_CONTENT_LIMIT);

  return {
    kpis: { projects, articles, pendingTestimonials },
    traffic,
    contentToTreat: { draftProjects, draftArticles, scheduledArticles, pendingTestimonials },
    topContent,
  };
}
