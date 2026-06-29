"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { createArticle, deleteArticle } from "@/lib/content/article";

function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Creates an article (optionally scheduled) from the editor form. */
export async function createArticleAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const status = str(form, "status") ?? "DRAFT";
  await createArticle(prisma, {
    title: str(form, "title"),
    slug: str(form, "slug"),
    excerpt: str(form, "excerpt"),
    content: str(form, "content") ?? "À compléter.",
    status,
    scheduledAt: str(form, "scheduledAt"),
    tags: (str(form, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  });
  revalidatePath("/articles");
}

/** Deletes an article. */
export async function deleteArticleAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  if (id) await deleteArticle(prisma, id);
  revalidatePath("/articles");
}
