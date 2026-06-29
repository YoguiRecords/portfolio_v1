import { defineRouting } from "next-intl/routing";

/**
 * Bilingual routing: FR is the default (no URL prefix), EN is served under `/en`.
 * `as-needed` keeps the FR URLs clean (`/`, `/actus`…) while EN gets `/en/…`.
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // FR is the canonical default at `/`; EN is explicit at `/en`. No automatic
  // Accept-Language redirect (otherwise `/` would vary by the visitor's browser).
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
