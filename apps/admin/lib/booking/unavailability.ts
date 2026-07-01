import type { PrismaClient } from "@portfolio/db";
import { UnavailabilityInput } from "@portfolio/core";

/** Lists current & upcoming unavailabilities (past ones are hidden). */
export function listUnavailabilities(prisma: PrismaClient, from: Date = new Date()) {
  return prisma.unavailability.findMany({
    where: { endAt: { gte: from } },
    orderBy: { startAt: "asc" },
  });
}

/** Creates an unavailability after Zod validation (rejects on invalid range). */
export async function createUnavailability(prisma: PrismaClient, raw: unknown) {
  const data = UnavailabilityInput.parse(raw);
  return prisma.unavailability.create({ data, select: { id: true } });
}

/** Deletes an unavailability by id. */
export function deleteUnavailability(prisma: PrismaClient, id: string) {
  return prisma.unavailability.delete({ where: { id } });
}
