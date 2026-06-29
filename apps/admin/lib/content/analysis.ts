import type { PrismaClient } from "@portfolio/db";
import { AnalysisInput, AnalysisItemInput } from "@portfolio/core";

/**
 * Strategic analysis persistence (write side, `app_admin`): SWOT/PESTEL/PORTER
 * blocks and their items. Validated with Zod, injectable for tests.
 */

/** Lists analyses with their ordered items. */
export function listAnalyses(prisma: PrismaClient) {
  return prisma.analysis.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
}

/** Creates an analysis block from validated input. */
export async function createAnalysis(prisma: PrismaClient, raw: unknown) {
  const data = AnalysisInput.parse(raw);
  return prisma.analysis.create({ data });
}

/** Deletes an analysis block (cascades to its items). */
export async function deleteAnalysis(prisma: PrismaClient, id: string) {
  await prisma.analysis.delete({ where: { id } });
}

/** Creates an item inside an analysis from validated input. */
export async function createAnalysisItem(prisma: PrismaClient, raw: unknown) {
  const data = AnalysisItemInput.parse(raw);
  return prisma.analysisItem.create({ data });
}

/** Deletes an analysis item by id. */
export async function deleteAnalysisItem(prisma: PrismaClient, id: string) {
  await prisma.analysisItem.delete({ where: { id } });
}
