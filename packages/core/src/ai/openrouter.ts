import type { Llm, LlmRequest, LlmResult } from "./llm";

/** Options for the OpenRouter-backed LLM (API key stays server-side, never logged). */
export interface OpenRouterOptions {
  apiKey: string;
  model: string;
  /** Injectable fetch (for tests). */
  fetchImpl?: typeof fetch;
}

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * OpenRouter adapter implementing the {@link Llm} port (OpenAI-compatible chat
 * completions). Tests inject `fetchImpl`, so no network/cost is incurred.
 */
export function createOpenRouterLlm(opts: OpenRouterOptions): Llm {
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    async complete(req: LlmRequest): Promise<LlmResult> {
      const messages = [
        ...(req.system ? [{ role: "system", content: req.system }] : []),
        ...req.messages.map((m) => ({ role: m.role, content: m.content })),
      ];
      const res = await doFetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: opts.model, messages }),
      });
      if (!res.ok) throw new Error(`openrouter_error:${res.status}`);
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { total_tokens?: number };
      };
      return {
        content: data.choices?.[0]?.message?.content ?? "",
      };
    },
  };
}
