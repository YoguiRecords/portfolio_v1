import { describe, expect, it } from "vitest";
import { generateSessionToken, hashToken } from "./token";

describe("session token", () => {
  it("generates unique, URL-safe tokens", () => {
    // Act
    const a = generateSessionToken();
    const b = generateSessionToken();

    // Assert
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it("hashes tokens deterministically as hex SHA-256", () => {
    // Arrange
    const token = "a-fixed-token";

    // Act
    const first = hashToken(token);
    const second = hashToken(token);

    // Assert
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(first).not.toBe(hashToken("different-token"));
  });
});
