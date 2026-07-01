import { buildSystemPrompt, type Llm, type LlmResult } from "@portfolio/core";

/** A single chat turn from the conversation history. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Runs one chatbot turn: assembles the guardrail system prompt (server-side,
 * separate from the user history) + public context, then calls the LLM. The
 * caller handles any returned tool calls (booking).
 *
 * @param llm - the LLM port (mocked in tests).
 * @param opts - public context, optional persona, and the conversation history.
 */
export async function runChat(
  llm: Llm,
  opts: { context: string; persona?: string | null; name?: string | null; history: ChatTurn[] },
): Promise<LlmResult> {
  const system = buildSystemPrompt(opts.context, opts.persona, opts.name);
  return llm.complete({ system, messages: opts.history });
}
