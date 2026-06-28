const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const DATETIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats a date as a French long date (e.g. "15 septembre 2026"). */
export function formatDate(date: Date | null): string {
  return date ? DATE_FMT.format(date) : "";
}

/** Formats a date-time as a French long date-time (events). */
export function formatDateTime(date: Date | null): string {
  return date ? DATETIME_FMT.format(date) : "";
}
