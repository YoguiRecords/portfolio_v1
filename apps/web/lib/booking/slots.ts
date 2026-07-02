/**
 * Presentation helpers for the booking slot picker: groups ISO slot starts by
 * Europe/Paris day and formats the labels for the active locale.
 */

/** One selectable slot (ISO value + localized time label). */
export interface SlotOption {
  iso: string;
  timeLabel: string;
}

/** Slots of a single Paris-time day, with its localized heading. */
export interface SlotDayGroup {
  dayLabel: string;
  slots: SlotOption[];
}

function formatters(locale: string) {
  const tag = locale === "en" ? "en-GB" : "fr-FR";
  return {
    day: new Intl.DateTimeFormat(tag, {
      timeZone: "Europe/Paris",
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    time: new Intl.DateTimeFormat(tag, {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/**
 * Groups slot starts by Paris day, preserving the input (chronological) order.
 *
 * @param isoSlots - Slot starts as ISO strings.
 * @param locale - Active locale (`fr` default, `en` supported).
 */
export function groupSlotsByDay(isoSlots: string[], locale: string): SlotDayGroup[] {
  const { day, time } = formatters(locale);
  const groups: SlotDayGroup[] = [];
  for (const iso of isoSlots) {
    const date = new Date(iso);
    const dayLabel = day.format(date);
    const last = groups[groups.length - 1];
    const option = { iso, timeLabel: time.format(date) };
    if (last && last.dayLabel === dayLabel) {
      last.slots.push(option);
    } else {
      groups.push({ dayLabel, slots: [option] });
    }
  }
  return groups;
}
