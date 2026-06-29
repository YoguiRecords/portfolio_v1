import type { PrismaClient } from "@portfolio/db";
import { FaqInput } from "@portfolio/core";

/** FAQ persistence (write side, `app_admin`). Validated with Zod, injectable for tests. */

/** Lists FAQ entries ordered for the editor. */
export function listFaqs(prisma: PrismaClient) {
  return prisma.faqEntry.findMany({ orderBy: [{ scope: "asc" }, { order: "asc" }] });
}

/** Creates a FAQ entry from validated input. */
export async function createFaq(prisma: PrismaClient, raw: unknown) {
  const data = FaqInput.parse(raw);
  return prisma.faqEntry.create({ data });
}

/** Deletes a FAQ entry by id. */
export async function deleteFaq(prisma: PrismaClient, id: string) {
  await prisma.faqEntry.delete({ where: { id } });
}
