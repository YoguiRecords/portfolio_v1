import type { Llm } from "./llm";

/** Per-field writing assistance actions offered in the back office. */
export type AssistAction = "correct" | "grammar" | "punctuation" | "rephrase" | "idea";

const PROMPTS: Record<AssistAction, string> = {
  correct:
    "Corrige l'orthographe, la grammaire et la ponctuation du texte. Conserve le sens " +
    "et le markdown. Réponds UNIQUEMENT par le texte corrigé.",
  grammar:
    "Corrige uniquement la grammaire du texte, sans en changer le style ni le sens. " +
    "Réponds UNIQUEMENT par le texte corrigé.",
  punctuation:
    "Corrige uniquement la ponctuation du texte. Réponds UNIQUEMENT par le texte corrigé.",
  rephrase:
    "Reformule le texte pour le rendre plus clair et percutant, en conservant le sens " +
    "et le markdown. Réponds UNIQUEMENT par le texte reformulé.",
  idea:
    "À partir du texte, propose une idée de continuation ou d'angle éditorial pertinent. " +
    "Réponds par une suggestion courte et actionnable.",
};

/**
 * Runs a per-field writing-assistance action through the LLM port. Each action
 * maps to a dedicated system prompt; the user text is sent as-is.
 *
 * @param llm - the LLM port (mocked in tests).
 * @param input - the action, the text, and the target locale.
 * @returns the suggestion text.
 */
export async function assistText(
  llm: Llm,
  input: { action: AssistAction; text: string; locale?: string },
): Promise<string> {
  const system =
    PROMPTS[input.action] + (input.locale ? `\nLangue du texte : ${input.locale}.` : "");
  const res = await llm.complete({
    system,
    messages: [{ role: "user", content: input.text }],
  });
  return res.content.trim();
}
