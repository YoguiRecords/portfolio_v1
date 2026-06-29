import type { PrismaClient } from "@portfolio/db";
import { HomeSectionInput } from "@portfolio/core";

/**
 * HomeSection persistence (write side, `app_admin`). Sections are structural
 * (fixed `key`s rendered by the home), so the editor only updates their text,
 * visibility and order — it does not create/delete sections.
 */

/** Lists home sections ordered for the editor. */
export function listSections(prisma: PrismaClient) {
  return prisma.homeSection.findMany({ orderBy: { order: "asc" } });
}

/** Updates a section's editable fields (validated with Zod). */
export async function updateSection(prisma: PrismaClient, id: string, raw: unknown) {
  const data = HomeSectionInput.parse(raw);
  return prisma.homeSection.update({ where: { id }, data });
}
