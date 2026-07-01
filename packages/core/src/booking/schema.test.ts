import { describe, it, expect } from "vitest";
import { UnavailabilityInput } from "./schema";

describe("UnavailabilityInput", () => {
  it("accepts a valid range and coerces dates", () => {
    const r = UnavailabilityInput.safeParse({
      startAt: "2026-08-01T00:00:00Z",
      endAt: "2026-08-15T00:00:00Z",
      reason: "Vacances",
    });
    expect(r.success).toBe(true);
    expect(r.success && r.data.startAt instanceof Date).toBe(true);
  });

  it("rejects an end before or equal to start", () => {
    expect(
      UnavailabilityInput.safeParse({ startAt: "2026-08-15T00:00:00Z", endAt: "2026-08-01T00:00:00Z" }).success,
    ).toBe(false);
    expect(
      UnavailabilityInput.safeParse({ startAt: "2026-08-01T00:00:00Z", endAt: "2026-08-01T00:00:00Z" }).success,
    ).toBe(false);
  });
});
