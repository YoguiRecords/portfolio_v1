/**
 * Pure scheduled-publishing logic (no DB, no clock) — shared by the cron
 * trigger that flips SCHEDULED articles/events to PUBLISHED once their
 * `scheduledAt` is reached.
 */

/** Anything carrying a publication status and an optional scheduled date. */
export interface Schedulable {
  status: string;
  scheduledAt: Date | null;
}

/**
 * Whether a schedulable item is due for publication at `now`.
 *
 * @param item - the item (status + scheduledAt).
 * @param now - the reference instant.
 * @returns true when status is SCHEDULED and the slot is reached.
 */
export function isDue(item: Schedulable, now: Date): boolean {
  return (
    item.status === "SCHEDULED" &&
    item.scheduledAt != null &&
    item.scheduledAt <= now
  );
}

/**
 * Partitions items into those due now and those still pending.
 *
 * @param items - schedulable items.
 * @param now - the reference instant.
 * @returns `{ due, pending }` preserving input order.
 */
export function splitDue<T extends Schedulable>(
  items: T[],
  now: Date,
): { due: T[]; pending: T[] } {
  const due: T[] = [];
  const pending: T[] = [];
  for (const it of items) (isDue(it, now) ? due : pending).push(it);
  return { due, pending };
}
