import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";
import { overlayMany, overlayOne } from "./overlay";

/**
 * Lists published public events, soonest first. Private/draft/scheduled events
 * are excluded (read-only `app_web`). For a non-FR locale the EN overlay is
 * applied to the title/location (fallback FR).
 *
 * @param prisma - Prisma client (injected for tests).
 * @param locale - active locale.
 */
export async function listEvents(prisma: PrismaClient, locale = "fr") {
  const rows = await prisma.event.findMany({
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
  return overlayMany(prisma, locale, "Event", rows, ["title", "locationName", "city"]);
}

/**
 * Loads a published public event by slug with its media gallery.
 *
 * @returns the event, or `null` when not found/published/public.
 */
export async function getEventBySlug(prisma: PrismaClient, slug: string, locale = "fr") {
  const event = await prisma.event.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "PUBLIC" },
    include: {
      media: { orderBy: { order: "asc" }, include: { media: true } },
      cover: true,
    },
  });
  return overlayOne(prisma, locale, "Event", event, ["title", "description", "locationName", "city"]);
}

export type EventListItem = Awaited<ReturnType<typeof listEvents>>[number];
export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;

/** Request-cached loaders bound to the shared client (used by pages). */
export const getEvents = cache((locale = "fr") => listEvents(sharedPrisma, locale));
export const getEvent = cache((slug: string, locale = "fr") =>
  getEventBySlug(sharedPrisma, slug, locale),
);
