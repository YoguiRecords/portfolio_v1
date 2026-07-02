"use server";

/**
 * Auth Server Actions for the back office (login / logout).
 *
 * Security notes:
 *  - All failures return the SAME generic message (no account enumeration).
 *  - A dummy argon2 verification runs when the email is unknown so response
 *    time does not reveal whether an account exists (timing-attack mitigation).
 *  - CSRF is covered by Next's built-in Server Action origin checks combined
 *    with the SameSite=Lax session cookie.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword, verifyTotp } from "@portfolio/core";
import { prisma } from "@portfolio/db";
import { loginSchema, totpCodeSchema } from "./schema";
import {
  createSession,
  destroySession,
  getCurrentSession,
  markSessionMfaVerified,
} from "./session";
import {
  isIpRateLimited,
  isLocked,
  parseClientIp,
  purgeOldAttempts,
  recordAttempt,
  registerAccountFailure,
  resetAccountFailures,
} from "./throttle";

/** Generic, non-enumerating error shown for every login failure. */
const GENERIC_LOGIN_ERROR = "Identifiants invalides.";

/** Generic error for an invalid TOTP code. */
const GENERIC_TOTP_ERROR = "Code invalide.";

/** State returned by {@link loginAction} for `useActionState`. */
export interface LoginState {
  error?: string;
}

/**
 * Lazily-computed argon2 hash used to equalize timing when no account matches.
 * Cached so the cost is paid once per process.
 */
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword("unused-placeholder-credential");
  return dummyHashPromise;
}

/**
 * Authenticates the admin from the login form and opens a session on success.
 *
 * @param _prev - Previous action state (unused).
 * @param formData - Submitted form data (`email`, `password`).
 * @returns A {@link LoginState} with a generic error, or redirects on success.
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const requestHeaders = await headers();
  const ip = parseClientIp(requestHeaders);
  const userAgent = requestHeaders.get("user-agent");

  const rawEmail = formData.get("email");
  const emailForLog = typeof rawEmail === "string" ? rawEmail.slice(0, 254) : "";

  // Per-IP rate limit, evaluated before any expensive work.
  if (await isIpRateLimited(ip)) {
    await recordAttempt({ email: emailForLog, ip, userAgent, success: false });
    return { error: GENERIC_LOGIN_ERROR };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    await recordAttempt({ email: emailForLog, ip, userAgent, success: false });
    return { error: GENERIC_LOGIN_ERROR };
  }

  const email = parsed.data.email.toLowerCase();
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  // Locked accounts are rejected without verifying (still generic message).
  if (admin && isLocked(admin.lockedUntil, new Date())) {
    await recordAttempt({ email, ip, userAgent, success: false });
    return { error: GENERIC_LOGIN_ERROR };
  }

  // Always run a verification (real or dummy) to keep timing constant.
  const passwordHash = admin?.passwordHash ?? (await getDummyHash());
  const passwordOk = await verifyPassword(passwordHash, parsed.data.password);

  if (!admin || !passwordOk) {
    if (admin) {
      await registerAccountFailure(admin.id, admin.failedAttempts);
    }
    await recordAttempt({ email, ip, userAgent, success: false });
    return { error: GENERIC_LOGIN_ERROR };
  }

  // Password OK: clear failure counters, record the success and keep the
  // audit table bounded (retention purge piggy-backed on success).
  await resetAccountFailures(admin.id);
  await recordAttempt({ email, ip, userAgent, success: true });
  await purgeOldAttempts();

  const meta = { ip, userAgent };

  // MFA mandatory: an enrolled admin gets a pending session and must pass the
  // TOTP step before the session becomes usable. A not-yet-enrolled admin gets
  // an active session and is forced to enrol (handled by the page guards).
  if (admin.isTotpEnabled) {
    await createSession(admin.id, { ...meta, mfaPending: true });
    redirect("/login/verify");
  }

  await createSession(admin.id, { ...meta, mfaPending: false });
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  redirect("/");
}

/** State returned by {@link verifyTotpAction}. */
export interface TotpState {
  error?: string;
}

/**
 * Completes the login MFA step: verifies the TOTP code for a pending session
 * and promotes it to fully authenticated.
 *
 * @param _prev - Previous action state (unused).
 * @param formData - Submitted form data (`code`).
 * @returns A {@link TotpState} with a generic error, or redirects on success.
 */
export async function verifyTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const session = await getCurrentSession();
  if (!session || !session.mfaPending) {
    redirect("/login");
  }

  const admin = session.adminUser;
  const requestHeaders = await headers();
  const ip = parseClientIp(requestHeaders);
  const userAgent = requestHeaders.get("user-agent");

  // Lockout (from password or TOTP failures) also blocks the MFA step.
  if (isLocked(admin.lockedUntil, new Date())) {
    await recordAttempt({ email: admin.email, ip, userAgent, success: false });
    return { error: GENERIC_TOTP_ERROR };
  }

  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") });
  const secret = admin.totpSecret;
  if (!parsed.success || !secret || !(await verifyTotp(parsed.data.code, secret))) {
    await registerAccountFailure(admin.id, admin.failedAttempts);
    await recordAttempt({ email: admin.email, ip, userAgent, success: false });
    return { error: GENERIC_TOTP_ERROR };
  }

  await resetAccountFailures(admin.id);
  await recordAttempt({ email: admin.email, ip, userAgent, success: true });
  await markSessionMfaVerified(session.id);
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  redirect("/");
}

/**
 * Logs the current admin out: revokes the session and returns to the login page.
 */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
