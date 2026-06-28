import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getHome } from "../lib/data/home";
import { SiteNav, type NavLink } from "../components/site-nav";
import { SiteFooter, type FooterSocial } from "../components/site-footer";
import { ScrollReveal } from "../components/scroll-reveal";

// The layout reads the DB (nav/footer/metadata), so the whole tree is rendered
// per request — no build-time DB dependency (CI builds without a database).
export const dynamic = "force-dynamic";

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

/** Builds metadata from SiteSettings (falls back to the profile / sane defaults). */
export async function generateMetadata(): Promise<Metadata> {
  const { settings, profile } = await getHome();
  const title = settings?.siteName ?? settings?.defaultSeoTitle ?? profile?.fullName ?? "Portfolio";
  const description = settings?.defaultSeoDescription ?? profile?.headline ?? "";
  return { title, description };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile, sections, settings } = await getHome();

  const links: NavLink[] = sections
    .filter((s) => SECTION_ANCHORS[s.key])
    .map((s) => ({ href: `#${SECTION_ANCHORS[s.key]}`, label: s.navLabel ?? s.key }));

  const socials: FooterSocial[] = (profile?.socials ?? []).map((s) => ({
    label: s.label,
    url: s.url,
  }));

  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ScrollReveal />
        <SiteNav brand={settings?.brandName ?? "Yohan."} links={links} />
        {children}
        <SiteFooter
          headline={settings?.footerHeadline ?? "La suite s'écrit ensemble."}
          signature={settings?.footerSignature ?? ""}
          socials={socials}
          legalName={profile?.fullName ?? "Yohan Debusscher"}
        />
      </body>
    </html>
  );
}
