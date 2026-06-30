import type { PrismaClient } from "@portfolio/db";

/** Persistence for generated CV PDFs (one row per locale, upserted). */

/** Lists the generated CV exports (one per locale at most). */
export function listCvExports(prisma: PrismaClient) {
  return prisma.cvExport.findMany({ orderBy: { locale: "asc" } });
}

/** Upserts the generated PDF for a locale (overwrites the previous one). */
export async function upsertCvExport(
  prisma: PrismaClient,
  data: { locale: string; url: string; sizeBytes: number },
) {
  return prisma.cvExport.upsert({
    where: { locale: data.locale },
    create: data,
    update: { url: data.url, sizeBytes: data.sizeBytes, generatedAt: new Date() },
  });
}
