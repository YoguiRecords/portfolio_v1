/** Public site base URL (env-driven; dev fallback). No trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

/**
 * Absolute URL for a path in a given locale. FR has no prefix; EN is under `/en`.
 *
 * @param path - path starting with `/` (e.g. `/projets/x`), or `/` for home.
 * @param locale - "fr" | "en".
 */
export function localizedUrl(path: string, locale: "fr" | "en"): string {
  const base = siteUrl();
  const clean = path === "/" ? "" : path;
  return locale === "fr" ? `${base}${clean || "/"}` : `${base}/en${clean}`;
}
