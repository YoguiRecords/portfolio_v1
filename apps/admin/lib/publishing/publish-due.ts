import type { PrismaClient } from "@portfolio/db";

/**
 * Flips every SCHEDULED article and event whose `scheduledAt` has passed to
 * PUBLISHED (stamping `publishedAt`). This is the write side of the scheduled
 * publishing feature — it runs with the `app_admin` role (the public `app_web`
 * role is read-only), driven by the protected cron endpoint.
 *
 * @param prisma - a write-capable Prisma client.
 * @param now - the reference instant (injected for deterministic tests).
 * @returns the number of articles and events published.
 */
export async function publishDue(
  prisma: PrismaClient,
  now: Date,
): Promise<{ articles: number; events: number }> {
  const articles = await prisma.article.updateMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    data: { status: "PUBLISHED", publishedAt: now },
  });
  const events = await prisma.event.updateMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    data: { status: "PUBLISHED", publishedAt: now },
  });
  return { articles: articles.count, events: events.count };
}
