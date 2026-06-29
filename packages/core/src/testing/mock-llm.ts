import type { Llm, LlmRequest, LlmResult } from "../ai/llm";

/**
 * Deterministic in-memory {@link Llm} for tests.
 *
 * Returns queued replies in order (empty string once exhausted) and records
 * every request on `calls` for assertions. No network, no API key, no cost.
 *
 * @param replies - replies to return, as plain strings or full results.
 * @returns an Llm whose `calls` array exposes the captured requests.
 */
export function mockLlm(
  replies: (string | LlmResult)[],
): Llm & { calls: LlmRequest[] } {
  const calls: LlmRequest[] = [];
  let i = 0;
  return {
    calls,
    async complete(req) {
      calls.push(req);
      const r = replies[i++] ?? "";
      return typeof r === "string" ? { content: r } : r;
    },
  };
}
