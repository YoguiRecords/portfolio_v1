import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { routing } from "../../i18n/routing";
import { getHome } from "../../lib/data/home";
import { SiteNav, type NavLink } from "../../components/site-nav";
import { SiteFooter, type FooterSocial } from "../../components/site-footer";
import { ScrollReveal } from "../../components/scroll-reveal";
import { LanguageSwitch } from "../../components/language-switch/language-switch";
import { ChatWidget } from "../../components/chat-widget/chat-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Maps a HomeSection key to its in-page anchor (sections without one are nav-hidden). */
const SECTION_ANCHORS: Record<string, string> = {
  profil: "about",
  ecosysteme: "eco",
  parcours: "path",
  cap: "goals",
  projets: "work",
};

// DB-driven layout (nav/footer/metadata) → per-request render, no build-time DB.
export const dynamic = "force-dynamic";

/** Pre-render both locales. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Builds metadata from SiteSettings (falls back to the profile). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { settings, profile } = await getHome(locale);
  const title = settings?.siteName ?? settings?.defaultSeoTitle ?? profile?.fullName ?? "Portfolio";
  const description = settings?.defaultSeoDescription ?? profile?.headline ?? "";
  return { title, description };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { profile, sections, settings } = await getHome(locale);

  const links: NavLink[] = sections
    .filter((s) => SECTION_ANCHORS[s.key])
    .map((s) => ({ href: `#${SECTION_ANCHORS[s.key]}`, label: s.navLabel ?? s.key }));

  const socials: FooterSocial[] = (profile?.socials ?? []).map((s) => ({
    label: s.label,
    url: s.url,
  }));

  return (
    <html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <ScrollReveal />
          <SiteNav brand={settings?.brandName ?? "Yohan."} links={links}>
            <LanguageSwitch />
          </SiteNav>
          {children}
          <SiteFooter
            headline={settings?.footerHeadline ?? "La suite s'écrit ensemble."}
            signature={settings?.footerSignature ?? ""}
            socials={socials}
            legalName={profile?.fullName ?? "Yohan Debusscher"}
          />
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
