"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { createKpi, updateKpi, deleteKpi } from "@/lib/content/kpi";
import { updateSection } from "@/lib/content/home-section";
import { createSkill, deleteSkill } from "@/lib/content/skill";
import { createFaq, deleteFaq } from "@/lib/content/faq";
import { upsertSettings } from "@/lib/content/site-settings";
import {
  createTrack,
  deleteTrack,
  createMilestone,
  deleteMilestone,
  createGoal,
  deleteGoal,
  updateGoal,
  moveGoal,
} from "@/lib/content/career";
import { upsertAnalysis, deleteAnalysis } from "@/lib/content/analysis";
import { upsertProfile } from "@/lib/content/profile";
import type { AnalysisType } from "@portfolio/core";

/** Reads an optional string FormData field (empty → undefined). */
function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Creates a KPI from the editor form. */
export async function createKpiAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createKpi(prisma, {
    label: str(form, "label"),
    value: str(form, "value"),
    note: str(form, "note"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/content");
}

/** Updates a KPI value/label from the inline editor. */
export async function updateKpiAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (!id) return;
  await updateKpi(prisma, id, {
    label: str(form, "label"),
    value: str(form, "value"),
    note: str(form, "note"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/content");
}

/** Deletes a KPI. */
export async function deleteKpiAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
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
  await requireEnrolledSession();
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
  await requireEnrolledSession();
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
  await requireEnrolledSession();
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
  await requireEnrolledSession();
  await createSkill(prisma, {
    name: str(form, "name"),
    category: str(form, "category"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/competences");
}
export async function deleteSkillAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteSkill(prisma, id);
  revalidatePath("/competences");
}

// ── FAQ ──
export async function createFaqAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
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
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteFaq(prisma, id);
  revalidatePath("/faq");
}

// ── Site settings ──
export async function saveSettingsAction(
  _prev: { ok?: boolean; error?: string },
  form: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  await requireEnrolledSession();
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

// ── Career (tracks, milestones, goals) ──
export async function createTrackAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createTrack(prisma, {
    name: str(form, "name"),
    slug: str(form, "slug"),
    colorHex: str(form, "colorHex") ?? "#f0a800",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}
export async function deleteTrackAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteTrack(prisma, id);
  revalidatePath("/parcours");
}
export async function createMilestoneAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createMilestone(prisma, {
    trackId: str(form, "trackId"),
    dateLabel: str(form, "dateLabel"),
    sortYear: Number(form.get("sortYear") ?? 0),
    role: str(form, "role"),
    description: str(form, "description"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}
export async function deleteMilestoneAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteMilestone(prisma, id);
  revalidatePath("/parcours");
}
export async function createGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createGoal(prisma, {
    role: str(form, "role"),
    status: str(form, "status") ?? "TARGET",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}
export async function deleteGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteGoal(prisma, id);
  revalidatePath("/parcours");
}
export async function updateGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await updateGoal(prisma, {
    id: str(form, "id"),
    role: str(form, "role"),
    status: str(form, "status") ?? "TARGET",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}
export async function moveGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? "up" : "down";
  if (id) await moveGoal(prisma, id, dir);
  revalidatePath("/parcours");
}

// ── Profile analyses (SWOT / 4P / Golden Circle / Ikigai) ──

/** Splits a textarea value into trimmed, non-empty lines (one bullet per line). */
function lines(form: FormData, name: string): string[] {
  return (str(form, name) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Builds the heterogeneous `data` payload from the editor form, per type. */
function analysisDataFromForm(type: string, form: FormData): unknown {
  const s = (k: string) => str(form, k) ?? "";
  switch (type) {
    case "SWOT":
      return {
        strengths: { label: s("strengthsLabel"), items: lines(form, "strengthsItems") },
        weaknesses: { label: s("weaknessesLabel"), items: lines(form, "weaknessesItems") },
        opportunities: { label: s("opportunitiesLabel"), items: lines(form, "opportunitiesItems") },
        threats: { label: s("threatsLabel"), items: lines(form, "threatsItems") },
      };
    case "FOUR_P":
      return {
        product: { label: s("productLabel"), role: s("productRole"), points: lines(form, "productPoints") },
        price: { label: s("priceLabel"), role: s("priceRole"), points: lines(form, "pricePoints") },
        place: { label: s("placeLabel"), role: s("placeRole"), points: lines(form, "placePoints") },
        promotion: { label: s("promotionLabel"), role: s("promotionRole"), points: lines(form, "promotionPoints") },
      };
    case "GOLDEN_CIRCLE":
      return { why: s("why"), how: s("how"), what: s("what") };
    case "IKIGAI":
      return { love: s("love"), good: s("good"), world: s("world"), paid: s("paid"), center: s("center") };
    default:
      return {};
  }
}

/** Upserts the single analysis of a type from its structured editor form. */
export async function upsertAnalysisAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const type = str(form, "type") ?? "SWOT";
  await upsertAnalysis(
    prisma,
    {
      type,
      title: str(form, "title"),
      order: Number(form.get("order") ?? 0),
      isVisible: form.get("isVisible") !== null,
    },
    analysisDataFromForm(type, form),
  );
  revalidatePath("/analyses");
}

/** Deletes the analysis of a given type. */
export async function deleteAnalysisAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const type = str(form, "type");
  if (type) await deleteAnalysis(prisma, type as AnalysisType);
  revalidatePath("/analyses");
}
