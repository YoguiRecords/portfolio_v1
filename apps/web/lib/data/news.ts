import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";

/**
 * Lists published articles, newest first. Scheduled/draft articles are excluded
 * (read-only `app_web`). Explicit `select` avoids over-fetching.
 *
 * @param prisma - Prisma client (injected for tests).
 */
export async function listArticles(prisma: PrismaClient) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      tags: true,
      featured: true,
      readingMinutes: true,
      publishedAt: true,
      cover: { select: { url: true, alt: true } },
    },
  });
}

/**
 * Loads a published article by slug with its gallery, source event and FAQs.
 *
 * @returns the article, or `null` when not found/published.
 */
export async function getArticleBySlug(prisma: PrismaClient, slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      media: { orderBy: { order: "asc" }, include: { media: true } },
      event: { select: { slug: true, title: true, startAt: true } },
      faqs: { where: { scope: "ARTICLE", isVisible: true }, orderBy: { order: "asc" } },
      cover: true,
    },
  });
}

export type ArticleListItem = Awaited<ReturnType<typeof listArticles>>[number];
export type ArticleDetail = NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>;

/** Request-cached loaders bound to the shared client (used by pages). */
export const getArticles = cache(() => listArticles(sharedPrisma));
export const getArticle = cache((slug: string) => getArticleBySlug(sharedPrisma, slug));
