// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { purgeOldAttempts, ATTEMPT_RETENTION_DAYS } from "./throttle";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("purgeOldAttempts supprime les tentatives au-delà de la rétention et garde les récentes", async () => {
  // Arrange — une tentative trop vieille et une récente.
  const now = new Date("2026-07-02T00:00:00Z");
  const old = new Date(now.getTime() - (ATTEMPT_RETENTION_DAYS + 10) * 86_400_000);
  const recent = new Date(now.getTime() - 86_400_000);
  await prisma.loginAttempt.create({
    data: { email: "a@b.c", ip: "1.1.1.1", userAgent: null, success: false, createdAt: old },
  });
  await prisma.loginAttempt.create({
    data: { email: "a@b.c", ip: "1.1.1.1", userAgent: null, success: true, createdAt: recent },
  });

  // Act
  await purgeOldAttempts(prisma, now);

  // Assert
  const remaining = await prisma.loginAttempt.findMany();
  expect(remaining).toHaveLength(1);
  expect(remaining[0]?.success).toBe(true);
});
