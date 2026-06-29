import type { MetadataRoute } from "next";
import { prisma } from "@portfolio/db";
import { siteUrl } from "../lib/seo/url";

export const dynamic = "force-dynamic";

/** AI crawler user-agents gated by `SiteSettings.allowAiCrawlers`. */
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"];

/** robots.txt: always allow general crawl; AI crawlers per the site setting. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await prisma.siteSettings.findFirst({
    select: { allowAiCrawlers: true },
  });
  const allowAi = settings?.allowAiCrawlers ?? true;

  const rules: MetadataRoute.Robots["rules"] = [{ userAgent: "*", allow: "/" }];
  if (!allowAi) {
    rules.push({ userAgent: AI_BOTS, disallow: "/" });
  }

  return {
    rules,
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
