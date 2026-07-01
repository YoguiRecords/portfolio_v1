// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import type { CalendarEvent, CalendarProvider, Mailbox } from "@portfolio/core/integrations";
import { createAppointment, SlotTakenError } from "./create-appointment";

const SLOT = "2026-07-06T07:00:00.000Z"; // Monday 9:00 Paris (summer)
const NOW = new Date("2026-07-01T00:00:00.000Z");

const VALID = {
  firstName: "Marc",
  lastName: "Durand",
  email: "marc@durand.fr",
  phone: "+33612345678",
  reason: "Projet web",
  requestedAt: SLOT,
};

function fakeCalendar(events: CalendarEvent[] = []): CalendarProvider {
  return { listEvents: async () => events, createEvent: async () => undefined };
}

function fakeMailbox(): { mailbox: Mailbox; send: ReturnType<typeof vi.fn> } {
  const send = vi.fn().mockResolvedValue(undefined);
  return { mailbox: { sendMessage: send } as unknown as Mailbox, send };
}

/** Prisma stub: no unavailabilities + a spied create returning an id. */
function fakePrisma(create: ReturnType<typeof vi.fn>) {
  return { unavailability: { findMany: async () => [] }, appointmentRequest: { create } } as never;
}

describe("createAppointment", () => {
  it("creates a PENDING chatbot RDV for a free slot and sends the email", async () => {
    const create = vi.fn().mockResolvedValue({ id: "rdv1" });
    const { mailbox, send } = fakeMailbox();

    const result = await createAppointment(fakePrisma(create), fakeCalendar(), mailbox, VALID, NOW);

    expect(result).toEqual({ id: "rdv1" });
    const data = create.mock.calls[0][0].data;
    expect(data.source).toBe("CHATBOT");
    expect(data.phone).toBe("+33612345678");
    expect(data.topic).toBe("Projet web");
    expect(typeof data.cancelToken).toBe("string");
    expect(data.cancelToken.length).toBeGreaterThan(10);
    expect(send).toHaveBeenCalledOnce();
  });

  it("rejects a slot already busy (never inserts)", async () => {
    const busy: CalendarEvent = {
      id: "b", title: "Busy", start: SLOT, end: "2026-07-06T07:30:00.000Z",
      location: null, isAllDay: false, kind: "appointment",
    };
    const create = vi.fn();
    const { mailbox } = fakeMailbox();

    await expect(createAppointment(fakePrisma(create), fakeCalendar([busy]), mailbox, VALID, NOW)).rejects.toBeInstanceOf(SlotTakenError);
    expect(create).not.toHaveBeenCalled();
  });

  it("maps a concurrent unique-violation to SlotTakenError", async () => {
    const create = vi.fn().mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const { mailbox } = fakeMailbox();
    await expect(createAppointment(fakePrisma(create), fakeCalendar(), mailbox, VALID, NOW)).rejects.toBeInstanceOf(SlotTakenError);
  });

  it("throws on invalid input (missing phone)", async () => {
    const create = vi.fn();
    const { mailbox } = fakeMailbox();
    const { phone, ...noPhone } = VALID;
    void phone;
    await expect(createAppointment(fakePrisma(create), fakeCalendar(), mailbox, noPhone, NOW)).rejects.toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });
});
