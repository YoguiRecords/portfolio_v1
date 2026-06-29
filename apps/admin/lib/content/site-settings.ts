import type { PrismaClient } from "@portfolio/db";
import { SiteSettingsInput } from "@portfolio/core";

/** Site settings persistence (singleton row), write side (`app_admin`). */

/** Returns the settings row (or null if not seeded). */
export function getSettings(prisma: PrismaClient) {
  return prisma.siteSettings.findFirst();
}

/** Creates or updates the singleton settings row from validated input. */
export async function upsertSettings(prisma: PrismaClient, raw: unknown) {
  const data = SiteSettingsInput.parse(raw);
  const existing = await prisma.siteSettings.findFirst();
  if (existing) return prisma.siteSettings.update({ where: { id: existing.id }, data });
  return prisma.siteSettings.create({ data });
}
