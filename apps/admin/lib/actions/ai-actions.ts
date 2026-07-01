"use server";

import { revalidatePath } from "next/cache";
import { assistText, assertBudget, recordUsage, type AssistAction } from "@portfolio/core";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requireEnrolledSession } from "@/lib/auth/guards";
import { buildAssistantLlm, getAiConfig } from "@/lib/ai/assistant";

/** Rough token estimate (≈ 4 chars/token) for the budget guard. */
function estimateTokens(text: string): number {
  return Math.ceil((text.length * 2) / 4);
}

/**
 * Updates the AI assistant configuration from the `/ai` settings form:
 * public chatbot on/off, BO assistance on/off, model slug, guardrail persona and
 * the monthly token budget. The OpenRouter key stays in `.env` (never editable).
 */
export async function updateAiConfigAction(form: FormData): Promise<void> {
  const session = await requireEnrolledSession();
  assertCanWrite(session);

  const config = await getAiConfig();
  const model = String(form.get("model") ?? "").trim();
  const persona = String(form.get("systemPersona") ?? "").trim();
  const budget = Number(form.get("monthlyTokenBudget"));

  await prisma.aiAssistantConfig.update({
    where: { id: config.id },
    data: {
      isPublicChatEnabled: form.get("isPublicChatEnabled") === "on",
      isBoAssistEnabled: form.get("isBoAssistEnabled") === "on",
      model: model || config.model,
      systemPersona: persona || null,
      monthlyTokenBudget:
        Number.isFinite(budget) && budget > 0 ? Math.floor(budget) : config.monthlyTokenBudget,
    },
  });
  revalidatePath("/ai");
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
