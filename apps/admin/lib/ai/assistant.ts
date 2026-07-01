import { createOpenRouterLlm, type Llm } from "@portfolio/core";
import { prisma } from "@portfolio/db";

/**
 * Builds the real OpenRouter-backed LLM for the back office. The API key lives
 * only in `.env` (never in the DB / never logged); the model comes from
 * `AiAssistantConfig`. Throws when the key is missing so the feature stays off
 * until configured.
 */
export async function buildAssistantLlm(): Promise<Llm> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("ai_not_configured");
  const config = await prisma.aiAssistantConfig.findFirst({ select: { model: true } });
  return createOpenRouterLlm({ apiKey, model: config?.model ?? "deepseek/deepseek-v4-flash" });
}

/** Loads (or lazily creates) the singleton AI config. */
export async function getAiConfig() {
  const existing = await prisma.aiAssistantConfig.findFirst();
  return existing ?? prisma.aiAssistantConfig.create({ data: {} });
}
