import type { MetadataRoute } from "next";
import { prisma } from "@portfolio/db";
import { localizedUrl } from "../lib/seo/url";

// Queries the DB at request time → no build-time DB dependency.
export const dynamic = "force-dynamic";

/** Sitemap with hreflang alternates for every published page, in both locales. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, events] = await Promise.all([
    prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const paths = [
    "/",
    "/actus",
    "/agenda",
    "/temoignages",
    "/contact",
    ...projects.map((p) => `/projets/${p.slug}`),
    ...articles.map((a) => `/actus/${a.slug}`),
    ...events.map((e) => `/agenda/${e.slug}`),
  ];

  return paths.map((path) => ({
    url: localizedUrl(path, "fr"),
    alternates: {
      languages: { fr: localizedUrl(path, "fr"), en: localizedUrl(path, "en") },
    },
  }));
}
