/**
 * Server-side auth guards used by protected pages and actions.
 *
 * They centralize the redirect rules so individual pages stay declarative.
 * `redirect()` throws, so the returned session is correctly narrowed as defined.
 */
import { redirect } from "next/navigation";
import { can, isReadOnly, type BoModule } from "@portfolio/core";
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

/**
 * Requires an enrolled session **with access to a given BO module** (RBAC).
 * Defense in depth: call this in BOTH the page and its Server Actions — a nav
 * filter alone protects nothing (actions are directly callable).
 *
 * @param module - the BO module the caller must be allowed to access.
 * @returns the authorized session.
 */
export async function requirePermission(module: BoModule): Promise<AuthenticatedSession> {
  const session = await requireEnrolledSession();
  if (!session.adminUser.isActive) {
    redirect("/login");
  }
  if (!can(session.adminUser, module)) {
    redirect("/403");
  }
  return session;
}

/** Shortcut: requires the account-management module (OWNER only). */
export async function requireOwner(): Promise<AuthenticatedSession> {
  return requirePermission("users");
}

/**
 * Write lock for the read-only VIEWER role. Call at the top of every mutating
 * Server Action so a VIEWER is rejected server-side (not just hidden in the UI).
 *
 * @throws when the session's account is read-only.
 */
export function assertCanWrite(session: AuthenticatedSession): void {
  if (isReadOnly(session.adminUser)) {
    throw new Error("read_only: ce compte est en lecture seule (mode démo).");
  }
}
