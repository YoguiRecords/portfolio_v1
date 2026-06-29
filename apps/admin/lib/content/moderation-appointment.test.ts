import type { PrismaClient } from "@portfolio/db";
import { expect, test, vi } from "vitest";
import { confirmAppointmentWithEvent } from "./moderation";

function fakePrisma(appt: unknown) {
  const update = vi.fn().mockResolvedValue(appt);
  const findUnique = vi.fn().mockResolvedValue(appt);
  const prisma = { appointmentRequest: { findUnique, update } } as unknown as PrismaClient;
  return { prisma, update, findUnique };
}

test("confirme le RDV et crée un évènement calendrier pour le créneau", async () => {
  const appt = { id: "1", name: "Alice", topic: "Démo", requestedAt: new Date("2026-07-01T10:00:00.000Z") };
  const { prisma, update } = fakePrisma(appt);
  const calendar = { createEvent: vi.fn().mockResolvedValue(undefined) };

  await confirmAppointmentWithEvent(prisma, calendar, "1");

  expect(update).toHaveBeenCalledWith({ where: { id: "1" }, data: { status: "CONFIRMED" } });
  expect(calendar.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ title: "RDV — Alice", start: "2026-07-01T10:00:00.000Z" }),
  );
});

test("reste non-bloquant si le calendrier n'est pas inscriptible", async () => {
  const appt = { id: "2", name: "Bob", topic: null, requestedAt: new Date("2026-07-02T09:00:00.000Z") };
  const { prisma, update } = fakePrisma(appt);
  const calendar = { createEvent: vi.fn().mockRejectedValue(new Error("no_writable_calendar")) };

  await expect(confirmAppointmentWithEvent(prisma, calendar, "2")).resolves.toBeUndefined();
  expect(update).toHaveBeenCalledWith({ where: { id: "2" }, data: { status: "CONFIRMED" } });
});
