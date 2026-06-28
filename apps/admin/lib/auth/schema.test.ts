import { describe, expect, it } from "vitest";
import { loginSchema, totpCodeSchema } from "./schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "admin@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("totpCodeSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(totpCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("rejects codes that are not exactly six digits", () => {
    expect(totpCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(totpCodeSchema.safeParse({ code: "1234567" }).success).toBe(false);
    expect(totpCodeSchema.safeParse({ code: "12ab56" }).success).toBe(false);
  });
});
