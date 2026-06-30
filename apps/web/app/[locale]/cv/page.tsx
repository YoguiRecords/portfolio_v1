import type { Metadata } from "next";
import { getCv } from "../../../lib/data/cv";
import { PublicCv } from "../../../components/cv/public-cv";

// Rendered per request from the database; the server still emits full HTML (SEO).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { profile } = await getCv(locale);
  const name = profile?.fullName ?? "CV";
  const title = locale === "en" ? `${name} — Résumé` : `${name} — CV`;
  const description = (profile?.cvAccroche ?? profile?.aiSummary ?? profile?.bio ?? "").slice(0, 300);
  return { title, description };
}

/** Public CV page (rich, bilingual). Kills the former `/cv` 404. */
export default async function CvPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getCv(locale);
  return (
    <main>
      <PublicCv data={data} />
    </main>
  );
}
