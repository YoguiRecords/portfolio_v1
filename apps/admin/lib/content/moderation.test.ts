// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import {
  approveTestimonial,
  editTestimonialContent,
  markMessageRead,
  confirmAppointment,
} from "./moderation";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("approveTestimonial passe en APPROVED + approvedAt", async () => {
  const t = await prisma.testimonial.create({
    data: { authorName: "X", content: "c", submittedContent: "c", status: "PENDING" },
  });
  const a = await approveTestimonial(prisma, t.id);
  expect(a.status).toBe("APPROVED");
  expect(a.approvedAt).not.toBeNull();
});

test("editTestimonialContent modifie content sans toucher submittedContent", async () => {
  const t = await prisma.testimonial.create({
    data: { authorName: "X", content: "original", submittedContent: "original", status: "PENDING" },
  });
  await editTestimonialContent(prisma, t.id, "édité par l'admin");
  const after = await prisma.testimonial.findUnique({ where: { id: t.id } });
  expect(after?.content).toBe("édité par l'admin");
  expect(after?.submittedContent).toBe("original");
});

test("markMessageRead bascule le flag", async () => {
  const m = await prisma.contactMessage.create({
    data: { name: "X", email: "a@b.com", message: "hello" },
  });
  await markMessageRead(prisma, m.id);
  expect((await prisma.contactMessage.findUnique({ where: { id: m.id } }))?.isRead).toBe(true);
});

test("confirmAppointment passe en CONFIRMED", async () => {
  const r = await prisma.appointmentRequest.create({ data: { name: "X", email: "a@b.com" } });
  const c = await confirmAppointment(prisma, r.id);
  expect(c.status).toBe("CONFIRMED");
});
