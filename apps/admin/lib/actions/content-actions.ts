"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { createKpi, updateKpi, deleteKpi } from "@/lib/content/kpi";
import { updateSection } from "@/lib/content/home-section";
import { createSkill, updateSkill, deleteSkill } from "@/lib/content/skill";
import { createFaq, deleteFaq } from "@/lib/content/faq";
import { upsertSettings } from "@/lib/content/site-settings";
import { upsertProfile } from "@/lib/content/profile";
import { str } from "./form-utils";

/** Creates a KPI from the editor form. */
export async function createKpiAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await createKpi(prisma, {
    label: str(form, "label"),
    value: str(form, "value"),
    note: str(form, "note"),
    order: Number(form.get("order") ?? 0),
    showOnCv: form.get("showOnCv") === "on",
  });
  revalidatePath("/content");
}

/** Updates a KPI value/label from the inline editor. */
export async function updateKpiAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (!id) return;
  await updateKpi(prisma, id, {
    label: str(form, "label"),
    value: str(form, "value"),
    note: str(form, "note"),
    order: Number(form.get("order") ?? 0),
    showOnCv: form.get("showOnCv") === "on",
  });
  revalidatePath("/content");
}

/** Deletes a KPI. */
export async function deleteKpiAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (id) await deleteKpi(prisma, id);
  revalidatePath("/content");
}

/** Feedback returned to the profile editor after a save attempt. */
export type ProfileFormState = { ok?: boolean; error?: string };

/**
 * Upserts the singleton Profile from the profile editor.
 * `useActionState`-compatible: returns a feedback state instead of `void`
 * so the client form can surface success/error to the user.
 */
export async function upsertProfileAction(
  _prev: ProfileFormState,
  form: FormData,
): Promise<ProfileFormState> {
  assertCanWrite(await requirePermission("profile"));
  try {
    await upsertProfile(prisma, {
      fullName: str(form, "fullName"),
      headline: str(form, "headline"),
      bio: str(form, "bio"),
      email: str(form, "email"),
      location: str(form, "location"),
      sigText: str(form, "sigText"),
      currentRole: str(form, "currentRole"),
      availabilityLabel: str(form, "availabilityLabel"),
      isAvailable: form.get("isAvailable") === "on",
      aiSummary: str(form, "aiSummary"),
      cvAccroche: str(form, "cvAccroche"),
      cvAvailabilityStart: str(form, "cvAvailabilityStart"),
      cvMobility: str(form, "cvMobility"),
      cvContractType: str(form, "cvContractType"),
      typewriterLines: (str(form, "typewriterLines") ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    });
  } catch {
    return { error: "Échec de l'enregistrement. Vérifiez les champs." };
  }
  revalidatePath("/profile");
  return { ok: true };
}

/** Feedback returned to the CV editor after a save attempt. */
export type CvFormState = { ok?: boolean; error?: string };

/**
 * Saves the singleton Profile's `cvHtml` (premium HTML CV). Stored as-is in DB;
 * rendered **isolated** (iframe srcdoc + CSP) on the BO/site — never injected
 * into the admin DOM (cf. STACK_SECURITY §5). Bounded length as a guardrail.
 */
export async function updateCvHtmlAction(_prev: CvFormState, form: FormData): Promise<CvFormState> {
  assertCanWrite(await requirePermission("content"));
  const cvHtml = typeof form.get("cvHtml") === "string" ? (form.get("cvHtml") as string) : "";
  if (cvHtml.length > 200_000) {
    return { error: "CV trop volumineux (200 000 caractères max)." };
  }
  const existing = await prisma.profile.findFirst({ select: { id: true } });
  if (!existing) return { error: "Profil introuvable. Enregistrez d'abord le profil." };
  await prisma.profile.update({ where: { id: existing.id }, data: { cvHtml } });
  revalidatePath("/cv");
  return { ok: true };
}

/** Updates a home section's text, visibility and order from the editor form. */
export async function updateHomeSectionAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  const key = str(form, "key");
  if (!id || !key) return;
  await updateSection(prisma, id, {
    key,
    navLabel: str(form, "navLabel"),
    eyebrow: str(form, "eyebrow"),
    title: str(form, "title"),
    intro: str(form, "intro"),
    ctaLabel: str(form, "ctaLabel"),
    ctaHref: str(form, "ctaHref"),
    order: Number(form.get("order") ?? 0),
    isVisible: form.get("isVisible") === "on",
  });
  revalidatePath("/content");
  revalidatePath("/");
}

// ── Skills ──
export async function createSkillAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("skills"));
  await createSkill(prisma, {
    name: str(form, "name"),
    category: str(form, "category"),
    kind: str(form, "kind") === "SOFT" ? "SOFT" : "TECH",
    showOnCv: form.get("showOnCv") === "on",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/competences");
  revalidatePath("/cv");
}
export async function updateSkillAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("skills"));
  const id = str(form, "id");
  if (!id) return;
  await updateSkill(prisma, id, {
    name: str(form, "name"),
    category: str(form, "category"),
    kind: str(form, "kind") === "SOFT" ? "SOFT" : "TECH",
    showOnCv: form.get("showOnCv") === "on",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/competences");
  revalidatePath("/cv");
}
export async function deleteSkillAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("skills"));
  const id = str(form, "id");
  if (id) await deleteSkill(prisma, id);
  revalidatePath("/competences");
  revalidatePath("/cv");
}

// ── FAQ ──
export async function createFaqAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("faq"));
  await createFaq(prisma, {
    question: str(form, "question"),
    answer: str(form, "answer"),
    scope: str(form, "scope") ?? "GLOBAL",
    order: Number(form.get("order") ?? 0),
    isVisible: form.get("isVisible") === "on",
  });
  revalidatePath("/faq");
}
export async function deleteFaqAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("faq"));
  const id = str(form, "id");
  if (id) await deleteFaq(prisma, id);
  revalidatePath("/faq");
}

// ── Site settings ──
export async function saveSettingsAction(
  _prev: { ok?: boolean; error?: string },
  form: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  assertCanWrite(await requirePermission("settings"));
  try {
    await upsertSettings(prisma, {
      brandName: str(form, "brandName"),
      siteName: str(form, "siteName"),
      defaultSeoTitle: str(form, "defaultSeoTitle"),
      defaultSeoDescription: str(form, "defaultSeoDescription"),
      footerHeadline: str(form, "footerHeadline"),
      footerSignature: str(form, "footerSignature"),
      contactEmail: str(form, "contactEmail"),
      availabilityBanner: str(form, "availabilityBanner"),
      isContactFormEnabled: form.get("isContactFormEnabled") === "on",
      allowAiCrawlers: form.get("allowAiCrawlers") === "on",
      llmsTxt: str(form, "llmsTxt"),
      robotsExtra: str(form, "robotsExtra"),
    });
  } catch {
    return { error: "Échec de l'enregistrement. Vérifiez les champs." };
  }
  revalidatePath("/reglages");
  return { ok: true };
}

