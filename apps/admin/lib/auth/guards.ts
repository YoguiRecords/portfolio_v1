/**
 * Server-side auth guards used by protected pages and actions.
 *
 * They centralize the redirect rules so individual pages stay declarative.
 * `redirect()` throws, so the returned session is correctly narrowed as defined.
 */
import { redirect } from "next/navigation";
import { getCurrentSession, type AuthenticatedSession } from "./session";

/**
 * Requires a fully-authenticated session (password + MFA completed).
 *
 * @returns The active session.
 */
export async function requireActiveSession(): Promise<AuthenticatedSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (session.mfaPending) {
    redirect("/login/verify");
  }
  return session;
}

/**
 * Requires an active session whose admin has enrolled TOTP (MFA mandatory).
 * Not-yet-enrolled admins are sent to the enrolment page.
 *
 * @returns The active, MFA-enrolled session.
 */
export async function requireEnrolledSession(): Promise<AuthenticatedSession> {
  const session = await requireActiveSession();
  if (!session.adminUser.isTotpEnabled) {
    redirect("/security/totp");
  }
  return session;
}
