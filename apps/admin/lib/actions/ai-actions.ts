"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assistText, assertBudget, estimateTokens, recordUsage, type AssistAction } from "@portfolio/core";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { buildAssistantLlm, getAiConfig } from "@/lib/ai/assistant";
import { uploadImage } from "@/lib/media/upload";
import { buildPorts } from "@/lib/media/ports";

/**
 * Updates the AI assistant configuration from the `/ai` settings form:
 * public chatbot on/off, BO assistance on/off, model slug, guardrail persona and
 * the monthly token budget. The OpenRouter key stays in `.env` (never editable).
 */
/** Zod boundary for the `/ai` settings form. Empty strings mean "keep/clear". */
const AiConfigInput = z.object({
  model: z.string().trim().max(100),
  systemPersona: z.string().trim().max(4000),
  assistantName: z.string().trim().max(60),
  assistantAvatarUrl: z.union([z.string().trim().url().max(500), z.literal("")]),
  monthlyTokenBudget: z.coerce.number().int().positive().optional().catch(undefined),
  isPublicChatEnabled: z.boolean(),
  isBoAssistEnabled: z.boolean(),
});

export async function updateAiConfigAction(form: FormData): Promise<void> {
  const session = await requirePermission("ai");
  assertCanWrite(session);

  const config = await getAiConfig();
  const input = AiConfigInput.parse({
    model: String(form.get("model") ?? ""),
    systemPersona: String(form.get("systemPersona") ?? ""),
    assistantName: String(form.get("assistantName") ?? ""),
    assistantAvatarUrl: String(form.get("assistantAvatarUrl") ?? ""),
    monthlyTokenBudget: form.get("monthlyTokenBudget"),
    isPublicChatEnabled: form.get("isPublicChatEnabled") === "on",
    isBoAssistEnabled: form.get("isBoAssistEnabled") === "on",
  });

  await prisma.aiAssistantConfig.update({
    where: { id: config.id },
    data: {
      isPublicChatEnabled: input.isPublicChatEnabled,
      isBoAssistEnabled: input.isBoAssistEnabled,
      assistantName: input.assistantName || config.assistantName,
      assistantAvatarUrl: input.assistantAvatarUrl || null,
      model: input.model || config.model,
      systemPersona: input.systemPersona || null,
      monthlyTokenBudget: input.monthlyTokenBudget ?? config.monthlyTokenBudget,
    },
  });
  revalidatePath("/ai");
}

/**
 * Uploads an avatar for the public chatbot through the secure image pipeline
 * (validate → webp/EXIF strip → MinIO → MediaAsset) and sets it as the assistant
 * avatar. One-step alternative to pasting a media URL.
 */
export async function uploadAssistantAvatarAction(form: FormData): Promise<void> {
  const session = await requirePermission("ai");
  assertCanWrite(session);
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadImage(
    buildPorts(),
    { buffer, mimeType: file.type, sizeBytes: file.size, originalName: file.name },
    "Avatar de l'assistante",
  );

  const config = await getAiConfig();
  await prisma.aiAssistantConfig.update({
    where: { id: config.id },
    data: { assistantAvatarUrl: asset.url },
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
  assertCanWrite(await requirePermission("ai"));
  if (!text.trim()) return { ok: false, error: "empty" };
  try {
    const config = await getAiConfig();
    if (!config.isBoAssistEnabled) return { ok: false, error: "disabled" };
    const estimated = estimateTokens(text, 2);
    assertBudget(config, estimated);

    const llm = await buildAssistantLlm();
    const suggestion = await assistText(llm, { action, text });

    const updated = recordUsage(config, estimateTokens(text + suggestion, 2));
    await prisma.aiAssistantConfig.update({
      where: { id: config.id },
      data: { tokensUsedThisMonth: updated.tokensUsedThisMonth },
    });
    return { ok: true, suggestion };
  } catch (error) {
    // Stable, whitelisted error codes only — never surface raw internals.
    const message = error instanceof Error ? error.message : "";
    const code = message === "ai_budget_exceeded" || message === "ai_not_configured" ? message : "ai_error";
    return { ok: false, error: code };
  }
}
