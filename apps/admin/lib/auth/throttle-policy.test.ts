import { describe, expect, it } from "vitest";
import {
  ACCOUNT_LOCKOUT_MINUTES,
  computeFailureUpdate,
  isLocked,
  MAX_ACCOUNT_FAILURES,
  parseClientIp,
} from "./throttle-policy";

describe("parseClientIp", () => {
  it("returns null when the header is absent", () => {
    expect(parseClientIp(null)).toBeNull();
  });

  it("returns the first IP of an X-Forwarded-For chain", () => {
    expect(parseClientIp("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    expect(parseClientIp("  198.51.100.4  ")).toBe("198.51.100.4");
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
