import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("produces an argon2id hash distinct from the plain text", async () => {
    // Arrange
    const plain = "S3cure-Passw0rd!";

    // Act
    const hash = await hashPassword(plain);

    // Assert
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain(plain);
  });

  it("verifies a correct password", async () => {
    // Arrange
    const plain = "S3cure-Passw0rd!";
    const hash = await hashPassword(plain);

    // Act
    const result = await verifyPassword(hash, plain);

    // Assert
    expect(result).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    // Arrange
    const hash = await hashPassword("S3cure-Passw0rd!");

    // Act
    const result = await verifyPassword(hash, "wrong-password");

    // Assert
    expect(result).toBe(false);
  });

  it("returns false for a malformed hash instead of throwing", async () => {
    // Act
    const result = await verifyPassword("not-a-valid-hash", "whatever");

    // Assert
    expect(result).toBe(false);
  });
});
