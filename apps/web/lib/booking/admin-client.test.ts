// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { fetchFreeSlots, submitBooking, submitCancel } from "./admin-client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("admin-client", () => {
  it("fetchFreeSlots returns the slots array and sends the internal token", async () => {
    process.env.APPOINTMENTS_INTERNAL_TOKEN = "secret";
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ slots: ["2026-07-06T07:00:00.000Z"] }));

    const slots = await fetchFreeSlots("2026-07-06T00:00:00Z", "2026-07-07T00:00:00Z", fetchImpl);

    expect(slots).toEqual(["2026-07-06T07:00:00.000Z"]);
    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers["x-internal-token"]).toBe("secret");
  });

  it("fetchFreeSlots returns [] on a non-ok response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    expect(await fetchFreeSlots("a", "b", fetchImpl)).toEqual([]);
  });

  it("submitBooking surfaces the admin status", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, 201));
    expect(await submitBooking({ x: 1 }, fetchImpl)).toEqual({ status: 201 });
  });

  it("submitCancel returns ok only when the admin says so", async () => {
    expect(await submitCancel("t", vi.fn().mockResolvedValue(jsonResponse({ ok: true })))).toEqual({ ok: true });
    expect(await submitCancel("t", vi.fn().mockResolvedValue(jsonResponse({ ok: false })))).toEqual({ ok: false });
    expect(await submitCancel("t", vi.fn().mockResolvedValue(new Response("x", { status: 500 })))).toEqual({ ok: false });
  });
});
