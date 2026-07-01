import type { PrismaClient } from "@portfolio/db";
import type { Mailbox } from "@portfolio/core/integrations";
import { expect, test, vi } from "vitest";
import { confirmAppointmentWithEvent, declineAppointment, cancelAppointment } from "./moderation";

function fakePrisma(appt: unknown) {
  const update = vi.fn().mockResolvedValue(appt);
  const findUnique = vi.fn().mockResolvedValue(appt);
  const prisma = { appointmentRequest: { findUnique, update } } as unknown as PrismaClient;
  return { prisma, update, findUnique };
}

function fakeMailbox() {
  const send = vi.fn().mockResolvedValue(undefined);
  return { mailbox: { sendMessage: send } as unknown as Mailbox, send };
}

test("confirme le RDV, crée l'évènement calendrier et notifie le visiteur", async () => {
  const appt = {
    id: "1", name: "Alice", firstName: "Alice", email: "alice@x.fr", topic: "Démo",
    requestedAt: new Date("2026-07-01T10:00:00.000Z"), durationMin: 30, cancelToken: "tok",
  };
  const { prisma, update } = fakePrisma(appt);
  const calendar = { createEvent: vi.fn().mockResolvedValue(undefined) };
  const { mailbox, send } = fakeMailbox();

  await confirmAppointmentWithEvent(prisma, calendar, mailbox, "1", "https://meet/x");

  expect(update).toHaveBeenCalledWith({ where: { id: "1" }, data: { status: "CONFIRMED" } });
  expect(calendar.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ title: "RDV — Alice", start: "2026-07-01T10:00:00.000Z", location: "https://meet/x" }),
  );
  expect(send).toHaveBeenCalledOnce();
});

test("reste non-bloquant si le calendrier n'est pas inscriptible", async () => {
  const appt = { id: "2", name: "Bob", email: "bob@x.fr", topic: null, requestedAt: new Date("2026-07-02T09:00:00.000Z") };
  const { prisma, update } = fakePrisma(appt);
  const calendar = { createEvent: vi.fn().mockRejectedValue(new Error("no_writable_calendar")) };
  const { mailbox } = fakeMailbox();

  await expect(confirmAppointmentWithEvent(prisma, calendar, mailbox, "2")).resolves.toBeUndefined();
  expect(update).toHaveBeenCalledWith({ where: { id: "2" }, data: { status: "CONFIRMED" } });
});

test("refuse le RDV (frees the slot) et notifie", async () => {
  const appt = { id: "3", name: "Carol", email: "c@x.fr", requestedAt: new Date("2026-07-03T09:00:00.000Z") };
  const { prisma, update } = fakePrisma(appt);
  const { mailbox, send } = fakeMailbox();

  await declineAppointment(prisma, mailbox, "3");

  expect(update).toHaveBeenCalledWith({ where: { id: "3" }, data: { status: "DECLINED" } });
  expect(send).toHaveBeenCalledOnce();
});

test("annule un RDV confirmé (frees the slot) et notifie", async () => {
  const appt = { id: "4", name: "Dan", email: "d@x.fr", requestedAt: new Date("2026-07-04T09:00:00.000Z") };
  const { prisma, update } = fakePrisma(appt);
  const { mailbox, send } = fakeMailbox();

  await cancelAppointment(prisma, mailbox, "4");

  expect(update).toHaveBeenCalledWith({ where: { id: "4" }, data: { status: "CANCELLED" } });
  expect(send).toHaveBeenCalledOnce();
});
