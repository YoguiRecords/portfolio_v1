import type { Metadata } from "next";
import { localizedUrl } from "./url";

/** Minimal SiteSettings shape used to derive default metadata. */
export interface SeoSettings {
  siteName?: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  twitterHandle?: string | null;
}

export interface BuildMetadataInput {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  settings: SeoSettings | null;
  locale: "fr" | "en";
  /** Path without locale prefix (e.g. `/projets/x`, or `/`). */
  path: string;
}

/**
 * Builds Next `Metadata` with OpenGraph, Twitter and hreflang alternates,
 * falling back to the site defaults from `SiteSettings`.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { settings, locale, path } = input;
  const title = input.title || settings?.defaultSeoTitle || settings?.siteName || "Portfolio";
  const description = input.description || settings?.defaultSeoDescription || "";
  const url = localizedUrl(path, locale);
  const images = input.ogImage ? [{ url: input.ogImage }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: localizedUrl(path, "fr"),
        en: localizedUrl(path, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(settings?.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(images ? { images } : {}),
    },
  };
}
