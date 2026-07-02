import { describe, expect, it } from "vitest";
import {
  ACCOUNT_LOCKOUT_MINUTES,
  computeFailureUpdate,
  isLocked,
  MAX_ACCOUNT_FAILURES,
  parseClientIp,
} from "./throttle-policy";

describe("parseClientIp", () => {
  it("returns null when no header is present (disables the per-IP check)", () => {
    expect(parseClientIp(new Headers())).toBeNull();
  });

  it("prefers the proxy-set X-Real-IP over a spoofable X-Forwarded-For", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.7",
      "x-forwarded-for": "6.6.6.6, 203.0.113.7",
    });
    expect(parseClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to the first X-Forwarded-For hop in dev", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.4, 10.0.0.1" });
    expect(parseClientIp(headers)).toBe("198.51.100.4");
  });
});

describe("isLocked", () => {
  const now = new Date("2026-01-01T12:00:00Z");

  it("is false when there is no lockout", () => {
    expect(isLocked(null, now)).toBe(false);
  });

  it("is true while the lockout is in the future", () => {
    expect(isLocked(new Date("2026-01-01T12:05:00Z"), now)).toBe(true);
  });

  it("is false once the lockout has elapsed", () => {
    expect(isLocked(new Date("2026-01-01T11:55:00Z"), now)).toBe(false);
  });
});

describe("computeFailureUpdate", () => {
  const now = new Date("2026-01-01T12:00:00Z");

  it("increments without locking below the threshold", () => {
    // Act
    const update = computeFailureUpdate(0, now);

    // Assert
    expect(update.failedAttempts).toBe(1);
    expect(update.lockedUntil).toBeNull();
  });

  it("locks and resets the counter at the threshold", () => {
    // Act — the failure that reaches MAX_ACCOUNT_FAILURES
    const update = computeFailureUpdate(MAX_ACCOUNT_FAILURES - 1, now);

    // Assert
    expect(update.failedAttempts).toBe(0);
    expect(update.lockedUntil).toEqual(
      new Date(now.getTime() + ACCOUNT_LOCKOUT_MINUTES * 60_000),
    );
  });
});
