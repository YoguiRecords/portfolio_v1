import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { loadCvDocument } from "@/lib/data/cv-document";
import { CvDocument } from "@/components/cv/cv-document";

export const dynamic = "force-dynamic";

/**
 * Internal-only route printed to PDF by the `cv-renderer` service. NOT routed by
 * Caddy and guarded by a shared token (`CV_RENDER_TOKEN`): the renderer sends it
 * as the `x-cv-token` header. In production the route is closed unless the token
 * matches; in development it is open for local preview/validation.
 *
 * Defense in depth — the rendered content (the CV) is public anyway (it is the
 * downloadable PDF), the guard just prevents an unexpected public HTML endpoint.
 */
export default async function CvDocumentRoute({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const expected = process.env.CV_RENDER_TOKEN;
  const provided = (await headers()).get("x-cv-token") ?? sp.token;

  if (expected) {
    if (provided !== expected) notFound();
  } else if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale = sp.locale === "en" ? "en" : "fr";
  const data = await loadCvDocument(prisma, locale);

  return <CvDocument data={data} />;
}
