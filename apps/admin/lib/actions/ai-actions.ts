"use server";

import { assistText, assertBudget, recordUsage, type AssistAction } from "@portfolio/core";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { buildAssistantLlm, getAiConfig } from "@/lib/ai/assistant";

/** Rough token estimate (≈ 4 chars/token) for the budget guard. */
function estimateTokens(text: string): number {
  return Math.ceil((text.length * 2) / 4);
}

/**
 * Per-field writing assistance (BO). Auth + budget guard + OpenRouter. Returns
 * the suggestion (the toolbar shows it; the admin accepts or ignores).
 *
 * @returns `{ ok, suggestion }` or `{ ok: false, error }` (e.g. not configured).
 */
export async function assistFieldAction(
  action: AssistAction,
  text: string,
): Promise<{ ok: true; suggestion: string } | { ok: false; error: string }> {
  await requireEnrolledSession();
  if (!text.trim()) return { ok: false, error: "empty" };
  try {
    const config = await getAiConfig();
    if (!config.isBoAssistEnabled) return { ok: false, error: "disabled" };
    const estimated = estimateTokens(text);
    assertBudget(config, estimated);

    const llm = await buildAssistantLlm();
    const suggestion = await assistText(llm, { action, text });

    const updated = recordUsage(config, estimateTokens(text + suggestion));
    await prisma.aiAssistantConfig.update({
      where: { id: config.id },
      data: { tokensUsedThisMonth: updated.tokensUsedThisMonth },
    });
    return { ok: true, suggestion };
  } catch (error) {
    const code = error instanceof Error ? error.message : "ai_error";
    return { ok: false, error: code };
  }
}
