import type { PrismaClient } from "@portfolio/db";
import type { CalendarProvider } from "@portfolio/core/integrations";
import { computeFreeSlots, DEFAULT_AVAILABILITY } from "@portfolio/core";

/**
 * Returns the free bookable slots (ISO start strings) in `[fromIso, toIso]`.
 *
 * Source of truth (admin-only): the composite calendar (`getCalendar()` —
 * blocking RDV + agenda events + Outlook when connected) minus the holidays /
 * unavailabilities declared in the BO. The web app never reads this directly; it
 * calls the token-guarded internal route that wraps this function.
 */
export async function listFreeSlots(
  prisma: PrismaClient,
  calendar: CalendarProvider,
  fromIso: string,
  toIso: string,
  now: Date = new Date(),
): Promise<string[]> {
  const from = new Date(fromIso);
  const to = new Date(toIso);

  const [events, unavailabilities] = await Promise.all([
    calendar.listEvents(fromIso, toIso),
    prisma.unavailability.findMany({
      where: { startAt: { lte: to }, endAt: { gte: from } },
    }),
  ]);

  const slots = computeFreeSlots({
    from,
    to,
    busy: events.map((e) => ({ start: new Date(e.start), end: new Date(e.end) })),
    unavailabilities: unavailabilities.map((u) => ({ start: u.startAt, end: u.endAt })),
    now,
    config: DEFAULT_AVAILABILITY,
  });

  return slots.map((s) => s.start.toISOString());
}
