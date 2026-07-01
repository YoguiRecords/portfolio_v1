"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { createArticle, deleteArticle, updateArticle } from "@/lib/content/article";

function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Creates an article (optionally scheduled) from the editor form. */
export async function createArticleAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("articles"));
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

/** Updates an article from the editor form (merges with current values). */
export async function updateArticleAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("articles"));
  const id = str(form, "id");
  if (!id) return;
  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) return;
  await updateArticle(prisma, id, {
    title: str(form, "title") ?? current.title,
    slug: str(form, "slug") ?? current.slug,
    excerpt: str(form, "excerpt") ?? current.excerpt,
    content: str(form, "content") ?? current.content,
    status: str(form, "status") ?? current.status,
    scheduledAt: str(form, "scheduledAt"),
    tags: (str(form, "tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    seoTitle: str(form, "seoTitle"),
    seoDescription: str(form, "seoDescription"),
    featured: current.featured,
  });
  revalidatePath("/articles");
  revalidatePath(`/articles/${id}`);
}

/** Deletes an article. */
export async function deleteArticleAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("articles"));
  const id = str(form, "id");
  if (id) await deleteArticle(prisma, id);
  revalidatePath("/articles");
}
