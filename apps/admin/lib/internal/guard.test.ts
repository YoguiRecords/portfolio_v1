// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { isInternalAuthorized } from "./guard";

const req = (token?: string) =>
  new Request("http://admin/api/internal/x", { headers: token ? { "x-internal-token": token } : {} });

const ORIGINAL = process.env.APPOINTMENTS_INTERNAL_TOKEN;
afterEach(() => {
  process.env.APPOINTMENTS_INTERNAL_TOKEN = ORIGINAL;
});

describe("isInternalAuthorized", () => {
  it("denies when the env token is unset (fail closed)", () => {
    delete process.env.APPOINTMENTS_INTERNAL_TOKEN;
    expect(isInternalAuthorized(req("anything"))).toBe(false);
  });

  it("denies a missing or wrong token", () => {
    process.env.APPOINTMENTS_INTERNAL_TOKEN = "secret";
    expect(isInternalAuthorized(req())).toBe(false);
    expect(isInternalAuthorized(req("nope"))).toBe(false);
  });

  it("allows the matching token", () => {
    process.env.APPOINTMENTS_INTERNAL_TOKEN = "secret";
    expect(isInternalAuthorized(req("secret"))).toBe(true);
  });
});
