// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as availabilityGET } from "./availability/route";
import { POST as appointmentsPOST } from "./appointments/route";
import { POST as cancelPOST } from "./appointments/cancel/route";

const ORIGINAL = process.env.APPOINTMENTS_INTERNAL_TOKEN;
beforeEach(() => {
  delete process.env.APPOINTMENTS_INTERNAL_TOKEN; // fail closed
});
afterEach(() => {
  process.env.APPOINTMENTS_INTERNAL_TOKEN = ORIGINAL;
});

describe("internal routes reject unauthenticated calls", () => {
  it("availability GET → 401", async () => {
    const res = await availabilityGET(new Request("http://admin/api/internal/availability"));
    expect(res.status).toBe(401);
  });

  it("appointments POST → 401", async () => {
    const res = await appointmentsPOST(
      new Request("http://admin/api/internal/appointments", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
  });

  it("cancel POST → 401", async () => {
    const res = await cancelPOST(
      new Request("http://admin/api/internal/appointments/cancel", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
  });
});
