// @vitest-environment node
import { expect, test, vi } from "vitest";
import type { CalendarEvent, CalendarProvider } from "@portfolio/core/integrations";
import { CompositeCalendar } from "./composite-calendar";

function stub(events: CalendarEvent[], canCreate = false): CalendarProvider {
  return {
    listEvents: async () => events,
    createEvent: async () => {
      if (!canCreate) throw new Error("read_only");
    },
  };
}

const ev = (id: string, start: string): CalendarEvent => ({
  id,
  title: id,
  start,
  end: start,
  location: null,
  isAllDay: false,
  kind: "event",
});

test("CompositeCalendar fusionne et trie les évènements des providers", async () => {
  const cal = new CompositeCalendar([
    stub([ev("b", "2026-06-10T10:00:00.000Z")]),
    stub([ev("a", "2026-06-05T09:00:00.000Z")]),
  ]);
  const out = await cal.listEvents("2026-06-01T00:00:00.000Z", "2026-06-30T00:00:00.000Z");
  expect(out.map((e) => e.id)).toEqual(["a", "b"]);
});

test("CompositeCalendar ignore un provider en erreur (n'efface pas le calendrier)", async () => {
  const broken: CalendarProvider = {
    listEvents: async () => {
      throw new Error("down");
    },
    createEvent: async () => {},
  };
  const cal = new CompositeCalendar([broken, stub([ev("ok", "2026-06-05T09:00:00.000Z")])]);
  const out = await cal.listEvents("2026-06-01T00:00:00.000Z", "2026-06-30T00:00:00.000Z");
  expect(out.map((e) => e.id)).toEqual(["ok"]);
});

test("CompositeCalendar délègue createEvent au premier provider inscriptible", async () => {
  const writable = stub([], true);
  const spy = vi.spyOn(writable, "createEvent");
  const cal = new CompositeCalendar([stub([]), writable]);
  await cal.createEvent({ title: "x", start: "2026-06-05T09:00:00.000Z", end: "2026-06-05T10:00:00.000Z" });
  expect(spy).toHaveBeenCalledOnce();
});

test("CompositeCalendar: createEvent échoue si aucun provider inscriptible", async () => {
  const cal = new CompositeCalendar([stub([]), stub([])]);
  await expect(
    cal.createEvent({ title: "x", start: "2026-06-05T09:00:00.000Z", end: "2026-06-05T10:00:00.000Z" }),
  ).rejects.toThrow(/no_writable_calendar/);
});
