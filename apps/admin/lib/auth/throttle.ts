/**
 * Brute-force defenses for the back office login (database-backed operations).
 *
 * Two independent layers:
 *  - Per-account lockout: N consecutive failures lock the account for a cooldown
 *    (tracked on `AdminUser.failedAttempts` / `lockedUntil`).
 *  - Per-IP rate limit: too many recent failures from one IP are rejected
 *    regardless of the account, slowing distributed guessing.
 *
 * Every attempt (success or failure) is recorded in `LoginAttempt` for auditing.
 * The pure decision helpers live in `throttle-policy.ts` and are re-exported here.
 */
import { prisma } from "@portfolio/db";
import { computeFailureUpdate, IP_WINDOW_MINUTES, MAX_IP_FAILURES } from "./throttle-policy";

export {
  ACCOUNT_LOCKOUT_MINUTES,
  computeFailureUpdate,
  IP_WINDOW_MINUTES,
  isLocked,
  MAX_ACCOUNT_FAILURES,
  MAX_IP_FAILURES,
  parseClientIp,
  type FailureUpdate,
} from "./throttle-policy";

/** A single login attempt to record. */
export interface AttemptRecord {
  email: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
}

/**
 * Persists a login attempt for auditing.
 *
 * @param attempt - The attempt to record.
 */
export async function recordAttempt(attempt: AttemptRecord): Promise<void> {
  await prisma.loginAttempt.create({ data: attempt });
}

/**
 * Checks whether an IP has exceeded the failure budget in the sliding window.
 *
 * @param ip - The client IP (null disables the check).
 * @returns `true` if the IP is currently rate-limited.
 */
export async function isIpRateLimited(ip: string | null): Promise<boolean> {
  if (!ip) {
    return false;
  }
  const since = new Date(Date.now() - IP_WINDOW_MINUTES * 60_000);
  const failures = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: since } },
  });
  return failures >= MAX_IP_FAILURES;
}

/**
 * Records a failed attempt against an account, applying lockout if warranted.
 *
 * @param adminId - The account id.
 * @param currentFailedAttempts - Failures recorded before this one.
 */
export async function registerAccountFailure(
  adminId: string,
  currentFailedAttempts: number,
): Promise<void> {
  const update = computeFailureUpdate(currentFailedAttempts, new Date());
  await prisma.adminUser.update({ where: { id: adminId }, data: update });
}

/**
 * Clears an account's failure counters after a successful authentication.
 *
 * @param adminId - The account id.
 */
export async function resetAccountFailures(adminId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { failedAttempts: 0, lockedUntil: null },
  });
}

/** Retention window for the `LoginAttempt` audit rows, in days. */
export const ATTEMPT_RETENTION_DAYS = 90;

/**
 * Deletes audit rows older than the retention window. Piggy-backed on every
 * successful login (cheap indexed delete) so the table stays bounded without a
 * dedicated scheduler.
 *
 * @param db - Prisma client (injectable for the test database).
 * @param now - Reference time (injectable for tests).
 */
export async function purgeOldAttempts(
  db: { loginAttempt: { deleteMany: (typeof prisma)["loginAttempt"]["deleteMany"] } } = prisma,
  now: Date = new Date(),
): Promise<void> {
  const cutoff = new Date(now.getTime() - ATTEMPT_RETENTION_DAYS * 86_400_000);
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
