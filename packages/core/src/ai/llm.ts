/**
 * Abstract LLM port (OpenRouter implementation lands in P14/P15).
 *
 * Decoupling the AI features from a concrete provider keeps business logic
 * testable with a deterministic mock (see `testing/mock-llm.ts`) and avoids
 * any network/cost during tests.
 */

/** A single chat message exchanged with the model. */
export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** A completion request: optional system prompt, message history, optional tools. */
export interface LlmRequest {
  system?: string;
  messages: LlmMessage[];
  tools?: unknown;
}

/** A completion result: text content plus optional function/tool calls. */
export interface LlmResult {
  content: string;
  toolCalls?: { name: string; args: unknown }[];
}

/** The port every LLM provider (or mock) implements. */
export interface Llm {
  complete(req: LlmRequest): Promise<LlmResult>;
}
