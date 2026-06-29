/** A single translated field value for a record (overlay row). */
export interface FieldTranslation {
  field: string;
  locale: string;
  value: string;
}

/**
 * Overlays translated fields onto a FR record for the given locale, falling back
 * to the FR value when a translation is missing. FR (the source of truth) is
 * returned untouched.
 *
 * @param record - the FR record (source columns).
 * @param translations - overlay rows for this record (any locale).
 * @param locale - target locale ("fr" returns the record as-is).
 * @param fields - the translatable field names to overlay.
 */
export function localize<T extends Record<string, unknown>>(
  record: T,
  translations: FieldTranslation[],
  locale: string,
  fields: (keyof T & string)[],
): T {
  if (locale === "fr") return record;
  const overlay = new Map(
    translations.filter((t) => t.locale === locale).map((t) => [t.field, t.value]),
  );
  const out = { ...record };
  for (const field of fields) {
    const value = overlay.get(field);
    if (value != null) out[field] = value as T[typeof field];
  }
  return out;
}
