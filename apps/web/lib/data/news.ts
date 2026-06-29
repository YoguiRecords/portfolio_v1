import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";
import { overlayMany, overlayOne } from "./overlay";

/**
 * Lists published articles, newest first. Scheduled/draft articles are excluded
 * (read-only `app_web`). Explicit `select` avoids over-fetching. For a non-FR
 * locale the EN overlay is applied to the title/excerpt (fallback FR).
 *
 * @param prisma - Prisma client (injected for tests).
 * @param locale - active locale.
 */
export async function listArticles(prisma: PrismaClient, locale = "fr") {
  const rows = await prisma.article.findMany({
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
  return overlayMany(prisma, locale, "Article", rows, ["title", "excerpt"]);
}

/**
 * Loads a published article by slug with its gallery, source event and FAQs.
 *
 * @returns the article, or `null` when not found/published.
 */
export async function getArticleBySlug(prisma: PrismaClient, slug: string, locale = "fr") {
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      media: { orderBy: { order: "asc" }, include: { media: true } },
      event: { select: { slug: true, title: true, startAt: true } },
      faqs: { where: { scope: "ARTICLE", isVisible: true }, orderBy: { order: "asc" } },
      cover: true,
    },
  });
  return overlayOne(prisma, locale, "Article", article, ["title", "excerpt", "content"]);
}

export type ArticleListItem = Awaited<ReturnType<typeof listArticles>>[number];
export type ArticleDetail = NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>;

/** Request-cached loaders bound to the shared client (used by pages). */
export const getArticles = cache((locale = "fr") => listArticles(sharedPrisma, locale));
export const getArticle = cache((slug: string, locale = "fr") =>
  getArticleBySlug(sharedPrisma, slug, locale),
);
