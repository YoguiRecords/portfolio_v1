/**
 * Password hashing for the back office admin account.
 *
 * Uses argon2id (memory-hard, the OWASP-recommended algorithm) via the native
 * `@node-rs/argon2` binding. Plain passwords are never stored or logged.
 */
import { hash, verify } from "@node-rs/argon2";

/**
 * argon2id parameters. Tuned for an interactive admin login on a single-user
 * back office: a ~64 MiB / 3-pass cost stays well under a second on modern
 * hardware while remaining expensive to brute-force offline.
 */
const ARGON2_OPTIONS = {
  // argon2id = 2 in @node-rs/argon2's Algorithm enum.
  algorithm: 2,
  memoryCost: 65536, // KiB (64 MiB)
  timeCost: 3,
  parallelism: 1,
} as const;

/**
 * Hashes a plain-text password with argon2id.
 *
 * @param plain - The plain-text password to hash.
 * @returns The encoded argon2 hash (includes algorithm, params and salt).
 */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

/**
 * Verifies a plain-text password against a stored argon2 hash.
 *
 * Returns `false` on any verification error (e.g. malformed hash) rather than
 * throwing, so callers can treat it as a boolean credential check.
 *
 * @param storedHash - The argon2 hash previously produced by {@link hashPassword}.
 * @param plain - The plain-text password to check.
 * @returns `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(storedHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}
