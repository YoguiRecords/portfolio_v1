import type { CalendarEvent, CalendarProvider, CreateEventInput } from "@portfolio/core/integrations";

/**
 * Merges several calendar providers into one view (e.g. the site's DB calendar +
 * the real Outlook calendar). Reads union all sources; a failing source is logged
 * and skipped so one broken provider never blanks the whole calendar. Writes go
 * to the first writable provider (the DB calendar is read-only).
 */
export class CompositeCalendar implements CalendarProvider {
  constructor(private readonly providers: CalendarProvider[]) {}

  async listEvents(fromIso: string, toIso: string): Promise<CalendarEvent[]> {
    const settled = await Promise.allSettled(
      this.providers.map((p) => p.listEvents(fromIso, toIso)),
    );
    const events: CalendarEvent[] = [];
    for (const result of settled) {
      if (result.status === "fulfilled") {
        events.push(...result.value);
      } else {
        console.error("[CompositeCalendar] a provider failed:", result.reason);
      }
    }
    return events.sort((a, b) => a.start.localeCompare(b.start));
  }

  async createEvent(input: CreateEventInput): Promise<void> {
    for (const provider of this.providers) {
      try {
        await provider.createEvent(input);
        return;
      } catch {
        // Read-only provider — try the next one.
      }
    }
    throw new Error("no_writable_calendar: connectez Outlook (Microsoft Graph) pour créer des évènements.");
  }
}
