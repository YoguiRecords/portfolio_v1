import { localize, type FieldTranslation } from "@portfolio/core";
import type { PrismaClient } from "@portfolio/db";

/**
 * Applies the EN translation overlay to a list of records of one model.
 *
 * For `fr` (or an empty list) the records are returned untouched. Otherwise the
 * `Translation` rows for those records are loaded in a single query and the given
 * string fields are overlaid with a FR fallback (untranslated fields stay FR).
 *
 * @param prisma - read-only `app_web` client.
 * @param locale - active locale.
 * @param model - the Prisma model name as stored in `Translation.model`.
 * @param records - the records to localize (must expose a string `id`).
 * @param fields - the string fields eligible for translation.
 */
export async function overlayMany<T extends { id: string }>(
  prisma: PrismaClient,
  locale: string,
  model: string,
  records: T[],
  fields: string[],
): Promise<T[]> {
  if (locale === "fr" || records.length === 0) return records;

  const rows = await prisma.translation.findMany({
    where: { locale, model, recordId: { in: records.map((r) => r.id) } },
    select: { recordId: true, field: true, locale: true, value: true },
  });

  return records.map(
    (record) =>
      localize(
        record as Record<string, unknown>,
        rows.filter((t) => t.recordId === record.id) as FieldTranslation[],
        locale,
        fields,
      ) as unknown as T,
  );
}

/** Single-record variant of {@link overlayMany}. Passes `null` through unchanged. */
export async function overlayOne<T extends { id: string }>(
  prisma: PrismaClient,
  locale: string,
  model: string,
  record: T | null,
  fields: string[],
): Promise<T | null> {
  if (!record) return record;
  const [out] = await overlayMany(prisma, locale, model, [record], fields);
  return out;
}
