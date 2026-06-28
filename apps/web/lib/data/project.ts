import type { PrismaClient } from "@portfolio/db";

/**
 * Loads a published project case-study by slug, with everything its page needs:
 * ordered visible blocks, gallery images, links, technologies and project FAQs.
 * Also resolves the next published project (by `order`) for navigation.
 *
 * Read-only (`app_web`): drafts are excluded, so an unpublished slug yields null.
 *
 * @param prisma - Prisma client (injected for tests).
 * @param slug - the project slug from the route.
 * @returns `{ project, next }` or `null` when not found/published.
 */
export async function getProjectBySlug(prisma: PrismaClient, slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      blocks: { where: { isVisible: true }, orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" }, include: { image: true } },
      links: { orderBy: { order: "asc" } },
      technologies: { select: { name: true, slug: true } },
      faqs: { where: { scope: "PROJECT", isVisible: true }, orderBy: { order: "asc" } },
      cover: true,
    },
  });
  if (!project) return null;

  const next = await prisma.project.findFirst({
    where: { status: "PUBLISHED", order: { gt: project.order } },
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });

  return { project, next };
}

/** The project detail payload, derived from the loader. */
export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;

/**
 * Lists published project slugs (for `generateStaticParams` / sitemap).
 *
 * @param prisma - Prisma client.
 */
export async function getPublishedProjectSlugs(prisma: PrismaClient): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => r.slug);
}
