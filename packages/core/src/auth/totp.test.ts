import { generate } from "otplib";
import { describe, expect, it } from "vitest";
import { buildTotpKeyUri, generateTotpSecret, verifyTotp } from "./totp";

describe("TOTP", () => {
  it("verifies a freshly generated code", async () => {
    // Arrange
    const secret = generateTotpSecret();
    const code = await generate({ secret });

    // Act
    const result = await verifyTotp(code, secret);

    // Assert
    expect(result).toBe(true);
  });

  it("rejects an incorrect code", async () => {
    // Arrange
    const secret = generateTotpSecret();

    // Act
    const result = await verifyTotp("000000", secret);

    // Assert
    expect(result).toBe(false);
  });

  it("builds an otpauth provisioning URI carrying the secret", () => {
    // Arrange
    const secret = generateTotpSecret();

    // Act
    const uri = buildTotpKeyUri("admin@example.com", secret);

    // Assert
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(`secret=${secret}`);
  });
});
