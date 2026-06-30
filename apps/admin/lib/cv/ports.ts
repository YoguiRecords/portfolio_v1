import { prisma } from "@portfolio/db";
import { putObject, randomName } from "@/lib/media/ports";
import type { CvExportPorts } from "./generate";

/**
 * Real implementations of the CV PDF ports, wired to the internal `cv-renderer`
 * service (Chromium headless) and MinIO. Server-side only — the renderer is never
 * reachable from the browser (internal Docker network, cf. STACK_SECURITY).
 */

const RENDERER_URL = process.env.CV_RENDERER_URL ?? "http://cv-renderer:5051";
const RENDER_TOKEN = process.env.CV_RENDER_TOKEN ?? "";

/** Asks cv-renderer to print the CV document for `locale` and returns the PDF bytes. */
async function generatePdf(locale: string): Promise<Buffer> {
  const res = await fetch(`${RENDERER_URL}/render`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-cv-token": RENDER_TOKEN },
    body: JSON.stringify({ locale }),
  });
  if (!res.ok) throw new Error(`cv_render_failed:${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Builds the production CV PDF ports (cv-renderer + MinIO + Prisma). */
export function buildCvPorts(): CvExportPorts {
  return { generatePdf, putObject, randomName, prisma };
}
