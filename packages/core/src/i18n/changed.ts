import { hashSource } from "./hash";

/** Minimal shape needed to compare a translation against its FR source. */
export interface SourceHashed {
  sourceHash: string;
}

/**
 * Whether the FR value has changed since the translation was produced — used to
 * skip an LLM call when nothing changed (anti-waste).
 *
 * @param frValue - the current FR value.
 * @param translation - the existing translation (or null/undefined).
 * @returns true if there is no translation or the FR source hash differs.
 */
export function frChanged(frValue: string, translation: SourceHashed | null | undefined): boolean {
  if (!translation) return true;
  return hashSource(frValue) !== translation.sourceHash;
}
