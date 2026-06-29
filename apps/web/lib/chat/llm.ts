import { createOpenRouterLlm, type Llm } from "@portfolio/core";
import { prisma } from "@portfolio/db";

/**
 * Builds the OpenRouter LLM for the public chatbot, or `null` when no API key is
 * configured (the key lives only in `.env`). The model comes from the AI config.
 */
export async function buildChatLlm(): Promise<Llm | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const config = await prisma.aiAssistantConfig.findFirst({ select: { model: true } });
  return createOpenRouterLlm({ apiKey, model: config?.model ?? "openrouter/fusion" });
}
