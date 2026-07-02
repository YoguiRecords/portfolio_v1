import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string equality for secret comparison (shared tokens, bearer
 * secrets). Avoids the early-exit timing signal of `===`.
 *
 * @param a - First value (e.g. the provided token).
 * @param b - Second value (e.g. the expected token).
 * @returns `true` when both strings are byte-identical.
 */
export function secretEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
