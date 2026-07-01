"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { generateCvExports } from "@/lib/cv/generate";
import { buildCvPorts } from "@/lib/cv/ports";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  createInterest,
  updateInterest,
  deleteInterest,
  reorderInterests,
} from "@/lib/content/cv-corpus";

/**
 * Generates the CV PDF for FR + EN via the internal `cv-renderer`, stores them in
 * MinIO and upserts the `CvExport` rows. Authenticated admin action.
 */
export async function generateCvPdfAction(): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await generateCvExports(buildCvPorts());
  revalidatePath("/cv");
}

/** Reads an optional string FormData field (empty → undefined). */
function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Splits a comma-separated field into trimmed, non-empty values. */
function csv(form: FormData, key: string): string[] {
  return (str(form, key) ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Splits a textarea field into trimmed, non-empty lines (one item per line). */
function lines(form: FormData, key: string): string[] {
  return (str(form, key) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Parses a hidden ordered id list (comma-joined) used by drag-reorder. */
function idList(form: FormData): string[] {
  return csv(form, "ids");
}

function experienceFields(form: FormData) {
  return {
    title: str(form, "title"),
    company: str(form, "company"),
    location: str(form, "location"),
    startDate: str(form, "startDate"),
    endDate: str(form, "endDate"),
    tier: str(form, "tier") ?? "MINI",
    badge: str(form, "badge") ?? "NONE",
    stack: csv(form, "stack"),
    bullets: lines(form, "bullets"),
    description: str(form, "description"),
    order: Number(form.get("order") ?? 0),
    showOnPdf: form.get("showOnPdf") === "on",
    showOnCvPage: form.get("showOnCvPage") === "on",
    showOnSite: form.get("showOnSite") === "on",
  };
}

// ── Experiences ──

export async function createExperienceAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await createExperience(prisma, experienceFields(form));
  revalidatePath("/experiences");
  revalidatePath("/cv");
}

export async function updateExperienceAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (!id) return;
  await updateExperience(prisma, { id, ...experienceFields(form) });
  revalidatePath("/experiences");
  revalidatePath("/cv");
}

export async function deleteExperienceAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (id) await deleteExperience(prisma, id);
  revalidatePath("/experiences");
  revalidatePath("/cv");
}

export async function reorderExperiencesAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await reorderExperiences(prisma, idList(form));
  revalidatePath("/experiences");
  revalidatePath("/cv");
}

// ── Education ──

function educationFields(form: FormData) {
  return {
    title: str(form, "title"),
    institution: str(form, "institution"),
    date: str(form, "date"),
    details: lines(form, "details"),
    order: Number(form.get("order") ?? 0),
    showOnPdf: form.get("showOnPdf") === "on",
    showOnCvPage: form.get("showOnCvPage") === "on",
  };
}

export async function createEducationAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await createEducation(prisma, educationFields(form));
  revalidatePath("/formations");
  revalidatePath("/cv");
}

export async function updateEducationAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (!id) return;
  await updateEducation(prisma, { id, ...educationFields(form) });
  revalidatePath("/formations");
  revalidatePath("/cv");
}

export async function deleteEducationAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (id) await deleteEducation(prisma, id);
  revalidatePath("/formations");
  revalidatePath("/cv");
}

export async function reorderEducationAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await reorderEducation(prisma, idList(form));
  revalidatePath("/formations");
  revalidatePath("/cv");
}

// ── Languages ──

export async function createLanguageAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await createLanguage(prisma, {
    name: str(form, "name"),
    level: str(form, "level"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/langues");
  revalidatePath("/cv");
}

export async function updateLanguageAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (!id) return;
  await updateLanguage(prisma, {
    id,
    name: str(form, "name"),
    level: str(form, "level"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/langues");
  revalidatePath("/cv");
}

export async function deleteLanguageAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (id) await deleteLanguage(prisma, id);
  revalidatePath("/langues");
  revalidatePath("/cv");
}

export async function reorderLanguagesAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await reorderLanguages(prisma, idList(form));
  revalidatePath("/langues");
  revalidatePath("/cv");
}

// ── Interests ──

export async function createInterestAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await createInterest(prisma, {
    label: str(form, "label"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/interets");
  revalidatePath("/cv");
}

export async function updateInterestAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (!id) return;
  await updateInterest(prisma, {
    id,
    label: str(form, "label"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/interets");
  revalidatePath("/cv");
}

export async function deleteInterestAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  const id = str(form, "id");
  if (id) await deleteInterest(prisma, id);
  revalidatePath("/interets");
  revalidatePath("/cv");
}

export async function reorderInterestsAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("content"));
  await reorderInterests(prisma, idList(form));
  revalidatePath("/interets");
  revalidatePath("/cv");
}
