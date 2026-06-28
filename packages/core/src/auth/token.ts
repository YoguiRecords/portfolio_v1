/**
 * Opaque session token helpers.
 *
 * A session is a high-entropy random token handed to the browser in an
 * httpOnly cookie. Only its SHA-256 hash is persisted server-side, so a leak of
 * the database never reveals usable session tokens (the raw token is required
 * to authenticate and is never stored).
 */
import { createHash, randomBytes } from "node:crypto";

/** Token entropy in bytes (256 bits). */
const TOKEN_BYTES = 32;

/**
 * Generates a cryptographically-random, URL-safe session token.
 *
 * @returns A base64url-encoded 256-bit token (the raw value for the cookie).
 */
export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * Hashes a session token for storage/lookup.
 *
 * SHA-256 is appropriate here (not argon2): the token is already high-entropy,
 * so the hash only needs to be one-way and fast, not brute-force resistant.
 *
 * @param token - The raw session token.
 * @returns The hex-encoded SHA-256 hash.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
