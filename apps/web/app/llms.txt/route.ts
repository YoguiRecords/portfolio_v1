import { prisma } from "@portfolio/db";

export const dynamic = "force-dynamic";

/**
 * Serves `/llms.txt` (a plain-text presentation for AI engines). Uses
 * `SiteSettings.llmsTxt` when set, otherwise a minimal profile-derived fallback.
 */
export async function GET(): Promise<Response> {
  const [settings, profile] = await Promise.all([
    prisma.siteSettings.findFirst({ select: { llmsTxt: true, siteName: true } }),
    prisma.profile.findFirst({ select: { fullName: true, headline: true, aiSummary: true } }),
  ]);

  const body =
    settings?.llmsTxt?.trim() ||
    [
      `# ${profile?.fullName ?? settings?.siteName ?? "Portfolio"}`,
      profile?.headline ?? "",
      profile?.aiSummary ?? "",
    ]
      .filter(Boolean)
      .join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
