import type { PrismaClient } from "@portfolio/db";
import { upsertCvExport } from "@/lib/content/cv-export";

/** Ports for the CV PDF pipeline — injectable for tests. */
export interface CvExportPorts {
  /** Renders the CV document for a locale to PDF bytes (via cv-renderer). */
  generatePdf(locale: string): Promise<Buffer>;
  /** Stores bytes in the public bucket, returns the public URL. */
  putObject(name: string, data: Buffer, contentType: string): Promise<string>;
  /** Non-guessable object-name generator. */
  randomName(): string;
  prisma: PrismaClient;
}

/** Locales generated on each run (one click → FR + EN). */
export const CV_LOCALES = ["fr", "en"] as const;

/**
 * Generates the CV PDF for every locale, stores each in MinIO under a randomized
 * name, and upserts the `CvExport` row. One click regenerates FR + EN.
 *
 * @returns the upserted exports (locale + url + size).
 */
export async function generateCvExports(ports: CvExportPorts) {
  const results = [];
  for (const locale of CV_LOCALES) {
    const pdf = await ports.generatePdf(locale);
    const url = await ports.putObject(`${ports.randomName()}-cv-${locale}.pdf`, pdf, "application/pdf");
    const row = await upsertCvExport(ports.prisma, { locale, url, sizeBytes: pdf.length });
    results.push(row);
  }
  return results;
}
