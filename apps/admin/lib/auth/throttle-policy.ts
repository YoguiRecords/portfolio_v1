/**
 * Pure brute-force policy (no I/O) — easy to unit-test in isolation.
 * The database-backed operations live in `throttle.ts`.
 */
import { clientIpFromHeaders } from "@portfolio/core";

/** Consecutive account failures that trigger a lockout. */
export const MAX_ACCOUNT_FAILURES = 5;
/** Account lockout duration, in minutes. */
export const ACCOUNT_LOCKOUT_MINUTES = 15;
/** Sliding window for the per-IP failure count, in minutes. */
export const IP_WINDOW_MINUTES = 15;
/** Failures from a single IP within the window before it is rate-limited. */
export const MAX_IP_FAILURES = 20;

/**
 * Extracts the trusted client IP from the request headers (`X-Real-IP` posé
 * par le proxy, non spoofable ; fallback dev X-Forwarded-For — cf. core).
 *
 * @param headers - The incoming request headers.
 * @returns The client IP, or null when absent (disables the per-IP check).
 */
export function parseClientIp(headers: Headers): string | null {
  const ip = clientIpFromHeaders(headers);
  return ip === "unknown" ? null : ip;
}

/**
 * Tells whether a lockout timestamp is still active.
 *
 * @param lockedUntil - The account's lockout expiry, or null.
 * @param now - The reference time.
 * @returns `true` if the account is currently locked.
 */
export function isLocked(lockedUntil: Date | null, now: Date): boolean {
  return lockedUntil !== null && lockedUntil.getTime() > now.getTime();
}

/** Result of folding a new failure into an account's counters. */
export interface FailureUpdate {
  failedAttempts: number;
  lockedUntil: Date | null;
}

/**
 * Computes the next account counters after a failed attempt. Once the threshold
 * is reached the account is locked and the counter resets, so a fresh batch of
 * attempts is available after the cooldown.
 *
 * @param currentFailedAttempts - Failures recorded before this one.
 * @param now - The reference time.
 * @returns The new `failedAttempts` / `lockedUntil` values.
 */
export function computeFailureUpdate(currentFailedAttempts: number, now: Date): FailureUpdate {
  const next = currentFailedAttempts + 1;
  if (next >= MAX_ACCOUNT_FAILURES) {
    return {
      failedAttempts: 0,
      lockedUntil: new Date(now.getTime() + ACCOUNT_LOCKOUT_MINUTES * 60_000),
    };
  }
  return { failedAttempts: next, lockedUntil: null };
}
