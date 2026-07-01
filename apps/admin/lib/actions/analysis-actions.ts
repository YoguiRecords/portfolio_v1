"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { ANALYSIS_TYPES, type AnalysisType } from "@portfolio/core";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { upsertAnalysis, deleteAnalysis } from "@/lib/content/analysis";
import { lines, str } from "./form-utils";

/** Narrows a raw form value to a known analysis type (SWOT fallback). */
function analysisType(value: string | undefined): AnalysisType {
  return (ANALYSIS_TYPES as readonly string[]).includes(value ?? "")
    ? (value as AnalysisType)
    : "SWOT";
}

/** Builds the heterogeneous `data` payload from the editor form, per type. */
function analysisDataFromForm(type: AnalysisType, form: FormData): unknown {
  const s = (k: string) => str(form, k) ?? "";
  switch (type) {
    case "SWOT":
      return {
        strengths: { label: s("strengthsLabel"), items: lines(form, "strengthsItems") },
        weaknesses: { label: s("weaknessesLabel"), items: lines(form, "weaknessesItems") },
        opportunities: { label: s("opportunitiesLabel"), items: lines(form, "opportunitiesItems") },
        threats: { label: s("threatsLabel"), items: lines(form, "threatsItems") },
      };
    case "FOUR_P":
      return {
        product: { label: s("productLabel"), role: s("productRole"), points: lines(form, "productPoints") },
        price: { label: s("priceLabel"), role: s("priceRole"), points: lines(form, "pricePoints") },
        place: { label: s("placeLabel"), role: s("placeRole"), points: lines(form, "placePoints") },
        promotion: { label: s("promotionLabel"), role: s("promotionRole"), points: lines(form, "promotionPoints") },
      };
    case "GOLDEN_CIRCLE":
      return { why: s("why"), how: s("how"), what: s("what") };
    case "IKIGAI":
      return { love: s("love"), good: s("good"), world: s("world"), paid: s("paid"), center: s("center") };
    default:
      return {};
  }
}

/** Upserts the single analysis of a type from its structured editor form. */
export async function upsertAnalysisAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("analyses"));
  const type = analysisType(str(form, "type"));
  await upsertAnalysis(
    prisma,
    {
      type,
      title: str(form, "title"),
      order: Number(form.get("order") ?? 0),
      isVisible: form.get("isVisible") !== null,
    },
    analysisDataFromForm(type, form),
  );
  revalidatePath("/analyses");
}

/** Deletes the analysis of a given type. */
export async function deleteAnalysisAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("analyses"));
  const raw = str(form, "type");
  if (raw && (ANALYSIS_TYPES as readonly string[]).includes(raw)) {
    await deleteAnalysis(prisma, raw as AnalysisType);
  }
  revalidatePath("/analyses");
}
