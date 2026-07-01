// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import type { Mailbox } from "@portfolio/core/integrations";
import { cancelByToken } from "./cancel-appointment";

function fakeMailbox() {
  const send = vi.fn().mockResolvedValue(undefined);
  return { mailbox: { sendMessage: send } as unknown as Mailbox, send };
}

describe("cancelByToken", () => {
  it("cancels a matching active appointment and notifies the visitor", async () => {
    const update = vi.fn().mockResolvedValue({});
    const prisma = {
      appointmentRequest: {
        findFirst: async () => ({
          id: "rdv1",
          firstName: "Marc",
          name: "Marc Durand",
          email: "marc@durand.fr",
          requestedAt: new Date("2026-07-06T07:00:00.000Z"),
        }),
        update,
      },
    } as never;
    const { mailbox, send } = fakeMailbox();

    const result = await cancelByToken(prisma, mailbox, "tok");

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ where: { id: "rdv1" }, data: { status: "CANCELLED" } });
    expect(send).toHaveBeenCalledOnce();
  });

  it("returns { ok: false } for an unknown token (no enumeration, no update)", async () => {
    const update = vi.fn();
    const prisma = { appointmentRequest: { findFirst: async () => null, update } } as never;
    const { mailbox } = fakeMailbox();

    expect(await cancelByToken(prisma, mailbox, "nope")).toEqual({ ok: false });
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an empty token", async () => {
    const prisma = { appointmentRequest: { findFirst: vi.fn(), update: vi.fn() } } as never;
    const { mailbox } = fakeMailbox();
    expect(await cancelByToken(prisma, mailbox, "")).toEqual({ ok: false });
  });
});
