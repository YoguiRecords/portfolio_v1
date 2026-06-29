import type { Client } from "@microsoft/microsoft-graph-client";
import type { CalendarEvent, CalendarProvider, CreateEventInput } from "@portfolio/core/integrations";

/** Shape of a Graph `event` resource (only the fields we project). */
interface GraphEvent {
  id: string;
  subject?: string;
  isAllDay?: boolean;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  location?: { displayName?: string };
}

function project(e: GraphEvent): CalendarEvent {
  return {
    id: `outlook-${e.id}`,
    title: e.subject ?? "(sans titre)",
    start: e.start?.dateTime ? new Date(e.start.dateTime).toISOString() : new Date(0).toISOString(),
    end: e.end?.dateTime ? new Date(e.end.dateTime).toISOString() : new Date(0).toISOString(),
    location: e.location?.displayName ?? null,
    isAllDay: e.isAllDay ?? false,
    kind: "external",
  };
}

/**
 * Real Outlook calendar over Microsoft Graph (app-only) for the configured
 * mailbox. Uses `calendarView` so recurring events are expanded into instances.
 */
export class GraphCalendar implements CalendarProvider {
  constructor(
    private readonly client: Client,
    private readonly user: string,
  ) {}

  async listEvents(fromIso: string, toIso: string): Promise<CalendarEvent[]> {
    const res = await this.client
      .api(`/users/${encodeURIComponent(this.user)}/calendarView`)
      .query({ startDateTime: fromIso, endDateTime: toIso })
      .select("id,subject,isAllDay,start,end,location")
      .top(100)
      .get();
    return ((res.value as GraphEvent[]) ?? []).map(project);
  }

  async createEvent(input: CreateEventInput): Promise<void> {
    await this.client.api(`/users/${encodeURIComponent(this.user)}/events`).post({
      subject: input.title,
      start: { dateTime: input.start, timeZone: "UTC" },
      end: { dateTime: input.end, timeZone: "UTC" },
      ...(input.location ? { location: { displayName: input.location } } : {}),
    });
  }
}
