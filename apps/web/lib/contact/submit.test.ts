// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { persistContact, persistAppointment } from "./submit";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

const meta = { ip: "1.2.3.4", userAgent: "test" };

test("persistContact crée un ContactMessage", async () => {
  await persistContact(prisma, { name: "X", email: "a@b.com", message: "Un message valide." }, meta);
  const rows = await prisma.contactMessage.findMany();
  expect(rows).toHaveLength(1);
  expect(rows[0].email).toBe("a@b.com");
});

test("persistAppointment crée une demande PENDING (source CONTACT)", async () => {
  await persistAppointment(prisma, { name: "X", email: "a@b.com", topic: "Audit" }, meta);
  const rows = await prisma.appointmentRequest.findMany();
  expect(rows).toHaveLength(1);
  expect(rows[0].status).toBe("PENDING");
  expect(rows[0].source).toBe("CONTACT");
});
