/**
 * Minimal in-memory sliding-window rate limiter. Sufficient for a single app
 * instance; a distributed store (Redis) would be needed if the app is scaled
 * horizontally.
 */

const store = new Map<string, number[]>();

export interface RateLimitOptions {
  /** Max allowed hits within the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/**
 * Records a hit for `key` and returns whether it is allowed under the limit.
 *
 * @param key - the bucket key (e.g. caller IP + route).
 * @param options - max hits and window length.
 * @param now - current time (injectable for deterministic tests).
 * @returns true if allowed, false if the limit is exceeded.
 */
export function allow(key: string, options: RateLimitOptions, now: number = Date.now()): boolean {
  sweepIfOversized(options.windowMs, now);
  const recent = (store.get(key) ?? []).filter((t) => now - t < options.windowMs);
  if (recent.length >= options.max) {
    store.set(key, recent);
    return false;
  }
  recent.push(now);
  store.set(key, recent);
  return true;
}

/**
 * Keeps the store bounded against key-rotation abuse (e.g. an IP sweep): past
 * the threshold, every bucket with no hit inside the window is evicted.
 */
const SWEEP_THRESHOLD = 10_000;

function sweepIfOversized(windowMs: number, now: number): void {
  if (store.size <= SWEEP_THRESHOLD) return;
  for (const [key, hits] of store) {
    if (!hits.some((t) => now - t < windowMs)) {
      store.delete(key);
    }
  }
}

/** Number of tracked buckets (test helper). */
export function rateLimitSize(): number {
  return store.size;
}

/** Clears all rate-limit buckets (test helper). */
export function resetRateLimit(): void {
  store.clear();
}
