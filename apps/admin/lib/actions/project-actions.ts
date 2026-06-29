"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { createProject, updateProject, deleteProject } from "@/lib/content/project";

function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Creates a project header from the editor form. */
export async function createProjectAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createProject(prisma, {
    title: str(form, "title"),
    slug: str(form, "slug"),
    summary: str(form, "summary"),
    content: str(form, "content") ?? "À compléter.",
    type: str(form, "type") ?? "SOFTWARE",
  });
  revalidatePath("/projets");
}

/** Toggles a project between DRAFT and PUBLISHED. */
export async function setProjectStatusAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
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
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteProject(prisma, id);
  revalidatePath("/projets");
}
