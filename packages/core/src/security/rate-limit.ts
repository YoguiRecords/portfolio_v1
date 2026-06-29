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
  const recent = (store.get(key) ?? []).filter((t) => now - t < options.windowMs);
  if (recent.length >= options.max) {
    store.set(key, recent);
    return false;
  }
  recent.push(now);
  store.set(key, recent);
  return true;
}

/** Clears all rate-limit buckets (test helper). */
export function resetRateLimit(): void {
  store.clear();
}
