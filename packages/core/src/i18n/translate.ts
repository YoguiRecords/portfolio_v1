import type { Llm } from "../ai/llm";
import { hashSource } from "./hash";

/** A produced translation for one field (ready to upsert into Translation). */
export interface TranslatedField {
  field: string;
  locale: string;
  value: string;
  isAuto: true;
  sourceHash: string;
}

const SYSTEM_PROMPT =
  "Tu es un traducteur professionnel. Traduis fidèlement le texte du français vers " +
  "la langue cible. Conserve le markdown et la mise en forme. Ne traduis pas les noms " +
  "propres ni les marques. Réponds UNIQUEMENT par la traduction, sans commentaire.";

/**
 * Translates each FR field via the LLM port, returning overlay rows tagged
 * `isAuto` with the source hash (so a later FR change can be detected).
 *
 * @param llm - the LLM port (mocked in tests — no network/cost).
 * @param fields - map of FR field name → FR value.
 * @param locale - target locale (e.g. "en").
 */
export async function translateFields(
  llm: Llm,
  fields: Record<string, string>,
  locale: string,
): Promise<TranslatedField[]> {
  const out: TranslatedField[] = [];
  for (const [field, fr] of Object.entries(fields)) {
    const res = await llm.complete({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Langue cible : ${locale}\n\n${fr}` }],
    });
    out.push({
      field,
      locale,
      value: res.content.trim(),
      isAuto: true,
      sourceHash: hashSource(fr),
    });
  }
  return out;
}
