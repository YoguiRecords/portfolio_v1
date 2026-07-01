/**
 * Free-slot computation for Friday's booking flow. Pure and deterministic (no
 * `Date.now()`), so it is fully testable. Working hours are interpreted as
 * wall-clock time in a given IANA timezone (default Europe/Paris), computed via
 * `Intl` so DST is handled correctly without a date library.
 */

/** A busy interval blocking a slot (calendar event, real RDV, unavailability). */
export interface BusyInterval {
  start: Date;
  end: Date;
}

/** A bookable time slot. */
export interface Slot {
  start: Date;
  end: Date;
}

/** Working-hours configuration used to generate candidate slots. */
export interface AvailabilityConfig {
  /** Weekdays open for booking. 0 = Sunday … 6 = Saturday. */
  weekdays: number[];
  /** First slot start hour (wall-clock, in `timeZone`). */
  startHour: number;
  /** Slots must END by this hour (wall-clock upper bound). */
  endHour: number;
  /** Slot length in minutes. */
  durationMin: number;
  /** IANA timezone the hours are expressed in. */
  timeZone: string;
}

/** Default: Monday–Saturday (Sunday off), 9h→20h Paris, 30-min slots on the hour. */
export const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  weekdays: [1, 2, 3, 4, 5, 6],
  startHour: 9,
  endHour: 20,
  durationMin: 30,
  timeZone: "Europe/Paris",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Calendar/clock parts of a UTC instant, read in `tz`. */
interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Parts of a UTC instant, read in `tz`. */
function zonedParts(instant: Date, tz: string): ZonedParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const out: ZonedParts = { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
  for (const p of dtf.formatToParts(instant)) {
    if (p.type in out) out[p.type as keyof ZonedParts] = Number(p.value);
  }
  return out;
}

/** Offset (ms) to add to a UTC instant to reach the `tz` wall clock. */
function tzOffsetMs(instant: Date, tz: string): number {
  const p = zonedParts(instant, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - instant.getTime();
}

/** UTC instant matching the given wall-clock time in `tz` (DST-aware). */
function zonedWallTimeToUtc(y: number, mo0: number, d: number, hour: number, tz: string): Date {
  const naive = Date.UTC(y, mo0, d, hour, 0, 0);
  const off1 = tzOffsetMs(new Date(naive), tz);
  const guess = new Date(naive - off1);
  const off2 = tzOffsetMs(guess, tz);
  return off2 === off1 ? guess : new Date(naive - off2);
}

function overlaps(slot: Slot, busy: BusyInterval): boolean {
  return slot.start < busy.end && busy.start < slot.end;
}

/**
 * Computes free bookable slots in `[from, to]`, honouring the working-hours
 * config, removing any slot overlapping a busy interval or an unavailability,
 * and never returning a slot starting before `now`.
 */
export function computeFreeSlots(input: {
  from: Date;
  to: Date;
  busy: BusyInterval[];
  unavailabilities: BusyInterval[];
  now: Date;
  config: AvailabilityConfig;
}): Slot[] {
  const { from, to, busy, unavailabilities, now, config } = input;
  const tz = config.timeZone;
  const blockers = [...busy, ...unavailabilities];
  const slots: Slot[] = [];

  // Iterate calendar days from the civil date of `from` to that of `to`.
  const startCivil = zonedParts(from, tz);
  const endCivil = zonedParts(to, tz);
  const endNum = Date.UTC(endCivil.year, endCivil.month - 1, endCivil.day);

  for (
    let cursor = new Date(Date.UTC(startCivil.year, startCivil.month - 1, startCivil.day));
    cursor.getTime() <= endNum;
    cursor = new Date(cursor.getTime() + MS_PER_DAY)
  ) {
    const y = cursor.getUTCFullYear();
    const mo0 = cursor.getUTCMonth();
    const d = cursor.getUTCDate();
    if (!config.weekdays.includes(cursor.getUTCDay())) continue;

    for (let h = config.startHour; h + config.durationMin / 60 <= config.endHour; h += 1) {
      const start = zonedWallTimeToUtc(y, mo0, d, h, tz);
      const end = new Date(start.getTime() + config.durationMin * 60_000);
      if (start < now || start < from || end > to) continue;
      const slot: Slot = { start, end };
      if (blockers.some((b) => overlaps(slot, b))) continue;
      slots.push(slot);
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}
