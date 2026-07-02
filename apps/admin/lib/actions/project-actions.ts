"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { createProject, updateProject, deleteProject } from "@/lib/content/project";
import { str } from "./form-utils";

/** Creates a project header from the editor form. */
export async function createProjectAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("projects"));
  await createProject(prisma, {
    title: str(form, "title"),
    slug: str(form, "slug"),
    summary: str(form, "summary"),
    content: str(form, "content") ?? "À compléter.",
    type: str(form, "type") ?? "SOFTWARE",
  });
  revalidatePath("/projets");
}

/** Updates a project header from the editor form (merges with current values). */
export async function updateProjectAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("projects"));
  const id = str(form, "id");
  if (!id) return;
  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) return;
  await updateProject(prisma, id, {
    ...current,
    title: str(form, "title") ?? current.title,
    slug: str(form, "slug") ?? current.slug,
    summary: str(form, "summary") ?? current.summary,
    type: str(form, "type") ?? current.type,
    role: str(form, "role"),
    tagline: str(form, "tagline"),
    statusLabel: str(form, "statusLabel"),
    status: str(form, "status") ?? current.status,
    featured: form.get("featured") === "on",
    showOnCv: form.get("showOnCv") === "on",
    cvBadge: str(form, "cvBadge") ?? current.cvBadge,
  });
  revalidatePath("/projets");
  revalidatePath(`/projets/${id}`);
  revalidatePath("/cv");
}

/** Toggles a project between DRAFT and PUBLISHED. */
export async function setProjectStatusAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("projects"));
  const id = str(form, "id");
  const status = str(form, "status");
  if (!id || !status) return;
  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) return;
  await updateProject(prisma, id, { ...current, status });
  revalidatePath("/projets");
}

/** Deletes a project. */
export async function deleteProjectAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("projects"));
  const id = str(form, "id");
  if (id) await deleteProject(prisma, id);
  revalidatePath("/projets");
}
