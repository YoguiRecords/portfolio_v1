// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { DbCalendar } from "./db-calendar";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

const FROM = "2026-09-01T00:00:00.000Z";
const TO = "2026-09-30T23:59:59.000Z";

test("DbCalendar expose les évènements d'agenda du mois", async () => {
  await prisma.event.create({
    data: { title: "Meetup", slug: "meetup-sep", startAt: new Date("2026-09-15T18:30:00.000Z") },
  });

  const cal = new DbCalendar(prisma);
  const events = await cal.listEvents(FROM, TO);

  expect(events).toHaveLength(1);
  expect(events[0].kind).toBe("event");
  expect(events[0].title).toBe("Meetup");
});

test("DbCalendar bloque les vrais RDV (confirmés + pending chatbot), ignore les leads contact souples", async () => {
  // Confirmé (toute source) → bloque.
  await prisma.appointmentRequest.create({
    data: {
      name: "Client A",
      email: "a@example.com",
      status: "CONFIRMED",
      source: "CONTACT",
      requestedAt: new Date("2026-09-10T14:00:00.000Z"),
      durationMin: 45,
    },
  });
  // En attente issu du chatbot → réservation réelle, bloque.
  await prisma.appointmentRequest.create({
    data: {
      name: "Client B",
      email: "b@example.com",
      status: "PENDING",
      source: "CHATBOT",
      requestedAt: new Date("2026-09-12T14:00:00.000Z"),
    },
  });
  // Souhait souple du formulaire de contact, non validé → ne bloque pas.
  await prisma.appointmentRequest.create({
    data: {
      name: "Client C",
      email: "c@example.com",
      status: "PENDING",
      source: "CONTACT",
      requestedAt: new Date("2026-09-13T14:00:00.000Z"),
    },
  });

  const cal = new DbCalendar(prisma);
  const events = await cal.listEvents(FROM, TO);

  const titles = events.map((e) => e.title);
  expect(events).toHaveLength(2);
  expect(titles.some((t) => t.includes("Client A"))).toBe(true);
  expect(titles.some((t) => t.includes("Client B"))).toBe(true);
  expect(titles.some((t) => t.includes("Client C"))).toBe(false);
  expect(events.every((e) => e.kind === "appointment")).toBe(true);
});

test("DbCalendar est en lecture seule", async () => {
  const cal = new DbCalendar(prisma);
  await expect(
    cal.createEvent({ title: "x", start: FROM, end: TO }),
  ).rejects.toThrow(/read_only/);
});
