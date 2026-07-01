import { describe, it, expect } from "vitest";
import { computeFreeSlots, DEFAULT_AVAILABILITY, type Slot } from "./availability";

const at = (iso: string) => new Date(iso);

// 2026-07-06 is a Monday in summer → Europe/Paris = UTC+2, so wall-clock 9h→19h
// maps to 07:00Z→17:00Z. Assertions use getUTCHours() (a plain Date method) rather
// than Intl formatting: under vitest, Dates returned from an imported module trip
// Intl's brand check ("Invalid time value"), while the real runtime formats fine.
const PARIS_SUMMER_UTC_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const MONDAY = { from: at("2026-07-06T00:00:00Z"), to: at("2026-07-06T23:59:59Z") };
const EARLY = at("2026-07-01T00:00:00Z");

function slotsFor(overrides: Partial<Parameters<typeof computeFreeSlots>[0]> = {}): Slot[] {
  return computeFreeSlots({
    ...MONDAY,
    busy: [],
    unavailabilities: [],
    now: EARLY,
    config: DEFAULT_AVAILABILITY,
    ...overrides,
  });
}

const utcHours = (slots: Slot[]) => slots.map((s) => s.start.getUTCHours());

describe("computeFreeSlots", () => {
  it("generates 30-min slots on the hour, 9h→20h Paris, for a working day (Mon)", () => {
    const slots = slotsFor();
    expect(slots).toHaveLength(11); // 9,10,…,19 (Paris)
    expect(utcHours(slots)).toEqual(PARIS_SUMMER_UTC_HOURS);
    expect(slots[0].end.getTime() - slots[0].start.getTime()).toBe(30 * 60_000);
  });

  it("excludes Sunday entirely (2026-07-05)", () => {
    const slots = slotsFor({ from: at("2026-07-05T00:00:00Z"), to: at("2026-07-05T23:59:59Z") });
    expect(slots).toHaveLength(0);
  });

  it("removes a slot overlapping a busy event", () => {
    const free = slotsFor();
    const eleven = free[2]; // 11:00 Paris = 09:00Z
    const slots = slotsFor({ busy: [{ start: eleven.start, end: eleven.end }] });
    expect(slots).toHaveLength(10);
    expect(utcHours(slots)).not.toContain(9);
  });

  it("removes every slot inside an unavailability range", () => {
    const slots = slotsFor({ unavailabilities: [{ start: MONDAY.from, end: MONDAY.to }] });
    expect(slots).toHaveLength(0);
  });

  it("never returns past slots (now = 17:30 Paris)", () => {
    const now = at("2026-07-06T15:30:00Z"); // 17:30 Paris
    const slots = slotsFor({ now });
    expect(slots.every((s) => s.start.getTime() >= now.getTime())).toBe(true);
    expect(utcHours(slots)).toEqual([16, 17]); // 18:00 & 19:00 Paris
  });

  it("treats a busy interval partially overlapping two consecutive slots as busy for both", () => {
    const free = slotsFor();
    const ten = free[1]; // 10:00 Paris = 08:00Z
    // 08:15Z → 09:15Z overlaps the 10:00 and 11:00 Paris slots.
    const busy = { start: new Date(ten.start.getTime() + 15 * 60_000), end: new Date(ten.start.getTime() + 75 * 60_000) };
    const hours = utcHours(slotsFor({ busy: [busy] }));
    expect(hours).not.toContain(8); // 10:00 Paris
    expect(hours).not.toContain(9); // 11:00 Paris
    expect(hours).toContain(7); // 09:00 Paris
    expect(hours).toContain(10); // 12:00 Paris
  });
});
