/** Formatting helpers for booking emails / labels (edge layer, uses Intl). */

/** Human label for a slot in French, Europe/Paris (e.g. "lundi 14 septembre 2026 à 10:00"). */
export function formatSlotLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

/** Public self-service cancellation URL for a given token. */
export function cancelUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  return `${base.replace(/\/$/, "")}/rdv/annuler?token=${encodeURIComponent(token)}`;
}
