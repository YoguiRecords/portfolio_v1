// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { createUnavailability } from "./unavailability";

describe("createUnavailability", () => {
  it("validates then persists a valid range", async () => {
    const create = vi.fn().mockResolvedValue({ id: "u1" });
    const prisma = { unavailability: { create } } as never;

    await createUnavailability(prisma, {
      startAt: "2026-08-01T00:00:00Z",
      endAt: "2026-08-15T00:00:00Z",
      reason: "Vacances",
    });

    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].data.reason).toBe("Vacances");
  });

  it("throws (and never persists) on an invalid range", async () => {
    const create = vi.fn();
    const prisma = { unavailability: { create } } as never;

    await expect(
      createUnavailability(prisma, { startAt: "2026-08-15T00:00:00Z", endAt: "2026-08-01T00:00:00Z" }),
    ).rejects.toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });
});
