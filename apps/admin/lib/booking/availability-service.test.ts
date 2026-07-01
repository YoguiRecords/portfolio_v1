// @vitest-environment node
import { describe, it, expect } from "vitest";
import type { CalendarEvent, CalendarProvider } from "@portfolio/core/integrations";
import { listFreeSlots } from "./availability-service";

const FROM = "2026-07-06T00:00:00.000Z"; // Monday (summer, Paris = UTC+2)
const TO = "2026-07-06T23:59:59.000Z";
const NOW = new Date("2026-07-01T00:00:00.000Z");

/** Fake calendar returning a fixed set of busy events. */
function fakeCalendar(events: CalendarEvent[]): CalendarProvider {
  return {
    listEvents: async () => events,
    createEvent: async () => undefined,
  };
}

/** Minimal prisma stub exposing only `unavailability.findMany`. */
function fakePrisma(unavailabilities: { startAt: Date; endAt: Date }[]) {
  return { unavailability: { findMany: async () => unavailabilities } } as never;
}

const busyEvent = (start: string, end: string): CalendarEvent => ({
  id: "x",
  title: "Busy",
  start,
  end,
  location: null,
  isAllDay: false,
  kind: "appointment",
});

describe("listFreeSlots", () => {
  it("returns ISO slot starts, 11 for an empty working day", async () => {
    const slots = await listFreeSlots(fakePrisma([]), fakeCalendar([]), FROM, TO, NOW);
    expect(slots).toHaveLength(11);
    expect(slots[0]).toBe("2026-07-06T07:00:00.000Z"); // 9:00 Paris
  });

  it("removes a slot overlapping a busy calendar event", async () => {
    const cal = fakeCalendar([busyEvent("2026-07-06T09:00:00.000Z", "2026-07-06T09:30:00.000Z")]); // 11:00 Paris
    const slots = await listFreeSlots(fakePrisma([]), cal, FROM, TO, NOW);
    expect(slots).toHaveLength(10);
    expect(slots).not.toContain("2026-07-06T09:00:00.000Z");
  });

  it("removes slots inside a declared unavailability", async () => {
    const off = [{ startAt: new Date(FROM), endAt: new Date(TO) }];
    const slots = await listFreeSlots(fakePrisma(off), fakeCalendar([]), FROM, TO, NOW);
    expect(slots).toHaveLength(0);
  });
});
