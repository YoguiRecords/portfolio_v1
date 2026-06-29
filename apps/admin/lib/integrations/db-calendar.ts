import type { PrismaClient } from "@portfolio/db";
import type { CalendarEvent, CalendarProvider, CreateEventInput } from "@portfolio/core/integrations";

/** Default appointment length when none is provided (minutes). */
const DEFAULT_APPOINTMENT_MIN = 30;

/**
 * Read-only calendar backed by the site's own data: agenda `Event`s plus
 * CONFIRMED `AppointmentRequest`s. Always available (no external account), so the
 * BO calendar shows real data from day one. Creating events is delegated to a
 * writable provider (Microsoft Graph) when connected.
 */
export class DbCalendar implements CalendarProvider {
  constructor(private readonly prisma: PrismaClient) {}

  async listEvents(fromIso: string, toIso: string): Promise<CalendarEvent[]> {
    const from = new Date(fromIso);
    const to = new Date(toIso);

    const [events, appointments] = await Promise.all([
      this.prisma.event.findMany({
        where: { startAt: { gte: from, lte: to } },
        orderBy: { startAt: "asc" },
      }),
      this.prisma.appointmentRequest.findMany({
        where: { status: "CONFIRMED", requestedAt: { gte: from, lte: to } },
        orderBy: { requestedAt: "asc" },
      }),
    ]);

    const eventItems: CalendarEvent[] = events.map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      start: e.startAt.toISOString(),
      end: (e.endAt ?? new Date(e.startAt.getTime() + 60 * 60 * 1000)).toISOString(),
      location: e.isOnline ? "En ligne" : ([e.locationName, e.city].filter(Boolean).join(" · ") || null),
      isAllDay: false,
      kind: "event",
    }));

    const appointmentItems: CalendarEvent[] = appointments
      .filter((a) => a.requestedAt)
      .map((a) => {
        const start = a.requestedAt as Date;
        const minutes = a.durationMin ?? DEFAULT_APPOINTMENT_MIN;
        return {
          id: `appointment-${a.id}`,
          title: `RDV — ${a.name}`,
          start: start.toISOString(),
          end: new Date(start.getTime() + minutes * 60 * 1000).toISOString(),
          location: a.topic ?? null,
          isAllDay: false,
          kind: "appointment" as const,
        };
      });

    return [...eventItems, ...appointmentItems].sort((a, b) => a.start.localeCompare(b.start));
  }

  async createEvent(_input: CreateEventInput): Promise<void> {
    throw new Error("read_only: le calendrier du site est en lecture seule (créer via l'agenda ou Outlook).");
  }
}
