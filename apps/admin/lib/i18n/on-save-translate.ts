import type { PrismaClient } from "@portfolio/db";
import { type Llm, translateFields, frChanged } from "@portfolio/core";

/**
 * Re-translates (and OVERWRITES) the EN overlay for the FR fields that changed,
 * to run after a back-office save. Product rule: whenever the FR source changes,
 * the EN is regenerated and replaced — even if it had been hand-edited. If a
 * field's FR is unchanged, no LLM call is made (anti-waste).
 *
 * @param prisma - write-capable client (`app_admin`).
 * @param llm - LLM port (mocked in tests).
 * @param model - the record's model name (e.g. "Article").
 * @param recordId - the record id.
 * @param frFields - map of translatable field → current FR value.
 * @param locale - target locale (default "en").
 * @returns the number of fields (re)translated.
 */
export async function retranslateOnSave(
  prisma: PrismaClient,
  llm: Llm,
  model: string,
  recordId: string,
  frFields: Record<string, string>,
  locale = "en",
): Promise<{ translated: number }> {
  const existing = await prisma.translation.findMany({ where: { model, recordId, locale } });
  const byField = new Map(existing.map((t) => [t.field, t]));

  const toTranslate: Record<string, string> = {};
  for (const [field, fr] of Object.entries(frFields)) {
    if (frChanged(fr, byField.get(field))) toTranslate[field] = fr;
  }
  if (Object.keys(toTranslate).length === 0) return { translated: 0 };

  const results = await translateFields(llm, toTranslate, locale);
  for (const r of results) {
    await prisma.translation.upsert({
      where: {
        model_recordId_field_locale: { model, recordId, field: r.field, locale },
      },
      update: { value: r.value, isAuto: true, sourceHash: r.sourceHash },
      create: {
        model,
        recordId,
        field: r.field,
        locale,
        value: r.value,
        isAuto: true,
        sourceHash: r.sourceHash,
      },
    });
  }
  return { translated: results.length };
}
