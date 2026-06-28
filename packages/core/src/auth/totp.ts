/**
 * TOTP (RFC 6238) helpers for the back office MFA, backed by `otplib` (v13
 * functional API). Defaults to the Noble crypto and Scure base32 plugins.
 *
 * The secret is generated server-side, shown once to the admin as a QR code
 * during enrolment, then verified on every subsequent login.
 */
import { generateSecret, generateURI, verify } from "otplib";

/** Issuer label shown in the authenticator app. */
const TOTP_ISSUER = "Yohan Debusscher BO";

/** Clock-drift tolerance in seconds (±30 s = ±1 time step). */
const EPOCH_TOLERANCE_SECONDS = 30;

/**
 * Generates a new base32 TOTP secret.
 *
 * @returns A base32-encoded secret to store against the admin account.
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * Builds the `otpauth://` provisioning URI encoded into the enrolment QR code.
 *
 * @param accountName - Identifier shown in the authenticator app (the admin email).
 * @param secret - The base32 TOTP secret.
 * @returns The provisioning URI.
 */
export function buildTotpKeyUri(accountName: string, secret: string): string {
  return generateURI({ issuer: TOTP_ISSUER, label: accountName, secret });
}

/**
 * Verifies a 6-digit TOTP code against a secret.
 *
 * @param token - The code entered by the admin.
 * @param secret - The base32 TOTP secret.
 * @returns `true` if the code is valid within the allowed drift window.
 */
export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token, epochTolerance: EPOCH_TOLERANCE_SECONDS });
    return result.valid;
  } catch {
    return false;
  }
}
