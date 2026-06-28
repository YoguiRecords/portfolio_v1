import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";

/**
 * Lists published public events, soonest first. Private/draft/scheduled events
 * are excluded (read-only `app_web`).
 *
 * @param prisma - Prisma client (injected for tests).
 */
export async function listEvents(prisma: PrismaClient) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC" },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      startAt: true,
      endAt: true,
      city: true,
      locationName: true,
      isOnline: true,
      cover: { select: { url: true, alt: true } },
    },
  });
}

/**
 * Loads a published public event by slug with its media gallery.
 *
 * @returns the event, or `null` when not found/published/public.
 */
export async function getEventBySlug(prisma: PrismaClient, slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "PUBLIC" },
    include: {
      media: { orderBy: { order: "asc" }, include: { media: true } },
      cover: true,
    },
  });
}

export type EventListItem = Awaited<ReturnType<typeof listEvents>>[number];
export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;

/** Request-cached loaders bound to the shared client (used by pages). */
export const getEvents = cache(() => listEvents(sharedPrisma));
export const getEvent = cache((slug: string) => getEventBySlug(sharedPrisma, slug));
