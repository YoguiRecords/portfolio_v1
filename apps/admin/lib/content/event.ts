import type { PrismaClient } from "@portfolio/db";
import { EventInput } from "@portfolio/core";

/** Agenda event persistence + news generation (write side, `app_admin`). */

export function listEvents(prisma: PrismaClient) {
  return prisma.event.findMany({ orderBy: { startAt: "asc" } });
}

export async function createEvent(prisma: PrismaClient, raw: unknown) {
  const data = EventInput.parse(raw);
  return prisma.event.create({ data });
}

export async function updateEvent(prisma: PrismaClient, id: string, raw: unknown) {
  const data = EventInput.parse(raw);
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(prisma: PrismaClient, id: string) {
  await prisma.event.delete({ where: { id } });
}

/**
 * Generates a DRAFT news article from an event (manual trigger). Linked via the
 * unique `Article.eventId`, so an event yields at most one generated article.
 */
export async function generateNewsFromEvent(prisma: PrismaClient, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("event_not_found");
  return prisma.article.create({
    data: {
      title: `À venir : ${event.title}`,
      slug: `actu-${event.slug}`,
      excerpt: (event.description ?? `Rendez-vous pour ${event.title}.`).slice(0, 300),
      content: event.description ?? `Rendez-vous pour ${event.title}.`,
      status: "DRAFT",
      eventId: event.id,
    },
  });
}
