/**
 * Server-side session service for the back office.
 *
 * Sessions are opaque: a random token lives in an httpOnly cookie, only its
 * hash is stored in the database. All functions run in the node runtime (they
 * use Prisma and `next/headers`).
 */
import { cookies } from "next/headers";
import { generateSessionToken, hashToken } from "@portfolio/core";
import { prisma, type AdminUser, type Session } from "@portfolio/db";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./constants";

/** A valid session joined with its admin account. */
export type AuthenticatedSession = Session & { adminUser: AdminUser };

/** Optional request metadata stored alongside a session for auditing. */
export interface SessionMeta {
  ip?: string | null;
  userAgent?: string | null;
  /** When true, the session is created awaiting TOTP verification (MFA step 2). */
  mfaPending?: boolean;
}

/**
 * Creates a session for the given admin and sets the session cookie.
 *
 * Must be called from a Server Action or Route Handler (it mutates cookies).
 *
 * @param adminUserId - The authenticated admin's id.
 * @param meta - Request metadata (ip, user agent, MFA-pending flag).
 */
export async function createSession(adminUserId: string, meta: SessionMeta = {}): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      adminUserId,
      expiresAt,
      mfaPending: meta.mfaPending ?? false,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/**
 * Resolves the current session from the request cookie.
 *
 * Expired sessions are deleted and treated as absent. Reads cookies only, so it
 * is safe to call from Server Components.
 *
 * @returns The authenticated session, or `null` if none/invalid/expired.
 */
export async function getCurrentSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });
  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session;
}

/**
 * Marks a session as MFA-verified (clears the pending flag after a valid TOTP).
 *
 * @param sessionId - The id of the session to promote to fully authenticated.
 */
export async function markSessionMfaVerified(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { mfaPending: false },
  });
}

/**
 * Revokes the current session (deletes it server-side and clears the cookie).
 *
 * Must be called from a Server Action or Route Handler (it mutates cookies).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
