"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { createKpi, updateKpi, deleteKpi } from "@/lib/content/kpi";
import { updateSection } from "@/lib/content/home-section";
import { upsertProfile } from "@/lib/content/profile";

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
