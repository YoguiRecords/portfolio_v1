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

test("DbCalendar inclut les RDV CONFIRMED, exclut les PENDING", async () => {
  await prisma.appointmentRequest.create({
    data: {
      name: "Client A",
      email: "a@example.com",
      status: "CONFIRMED",
      requestedAt: new Date("2026-09-10T14:00:00.000Z"),
      durationMin: 45,
    },
  });
  await prisma.appointmentRequest.create({
    data: {
      name: "Client B",
      email: "b@example.com",
      status: "PENDING",
      requestedAt: new Date("2026-09-12T14:00:00.000Z"),
    },
  });

  const cal = new DbCalendar(prisma);
  const events = await cal.listEvents(FROM, TO);

  expect(events).toHaveLength(1);
  expect(events[0].kind).toBe("appointment");
  expect(events[0].title).toContain("Client A");
});

test("DbCalendar est en lecture seule", async () => {
  const cal = new DbCalendar(prisma);
  await expect(
    cal.createEvent({ title: "x", start: FROM, end: TO }),
  ).rejects.toThrow(/read_only/);
});
