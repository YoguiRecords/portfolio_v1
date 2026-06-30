import type { PrismaClient } from "@portfolio/db";
import { AnalysisInput, parseAnalysis, type AnalysisType } from "@portfolio/core";

/**
 * Profile-level analyses persistence (write side, `app_admin`): the four
 * frameworks (SWOT / 4P / Golden Circle / Ikigai). One row per type; the
 * heterogeneous `data` payload is validated by Zod (`parseAnalysis`), symmetric
 * with the public renderer — the BO can never store a payload the site rejects.
 */

/** Lists analyses (with their JSON `data`), ordered. */
export function listAnalyses(prisma: PrismaClient) {
  return prisma.analysis.findMany({ orderBy: { order: "asc" } });
}

/**
 * Upserts the single analysis of a given type. Validates the meta with
 * `AnalysisInput` and the payload with the type's schema (`parseAnalysis`).
 *
 * @throws if the type is unknown or the payload fails validation.
 */
export async function upsertAnalysis(prisma: PrismaClient, rawMeta: unknown, rawData: unknown) {
  const meta = AnalysisInput.parse(rawMeta);
  const parsed = parseAnalysis(meta.type, rawData);
  if (!parsed) throw new Error(`Données d'analyse invalides pour le type ${meta.type}`);
  const fields = {
    title: meta.title ?? null,
    order: meta.order,
    isVisible: meta.isVisible,
    data: parsed.data,
  };
  return prisma.analysis.upsert({
    where: { type: meta.type },
    create: { type: meta.type, ...fields },
    update: fields,
  });
}

/** Deletes the analysis of a given type (idempotent). */
export async function deleteAnalysis(prisma: PrismaClient, type: AnalysisType) {
  await prisma.analysis.deleteMany({ where: { type } });
}
