import type { MetadataRoute } from "next";

/**
 * Back office : jamais indexé. Un robots.txt explicite évite que la route
 * catch-all serve du HTML aux crawlers (et aux audits) qui demandent le fichier.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
