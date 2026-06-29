import type { PrismaClient } from "@portfolio/db";
import { ProfileInput } from "@portfolio/core";

/**
 * Upserts the singleton Profile (write side, `app_admin`). Validated with Zod;
 * injected client for testability.
 */
export async function upsertProfile(prisma: PrismaClient, raw: unknown) {
  const data = ProfileInput.parse(raw);
  const existing = await prisma.profile.findFirst({ select: { id: true } });
  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data });
  }
  return prisma.profile.create({ data });
}
