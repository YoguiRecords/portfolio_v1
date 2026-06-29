import type { PrismaClient } from "@portfolio/db";
import { ArticleInput } from "@portfolio/core";

/** Article persistence with scheduled publishing (write side, `app_admin`). */

export function listArticles(prisma: PrismaClient) {
  return prisma.article.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createArticle(prisma: PrismaClient, raw: unknown) {
  const data = ArticleInput.parse(raw);
  return prisma.article.create({ data });
}

export async function updateArticle(prisma: PrismaClient, id: string, raw: unknown) {
  const data = ArticleInput.parse(raw);
  return prisma.article.update({ where: { id }, data });
}

export async function deleteArticle(prisma: PrismaClient, id: string) {
  await prisma.article.delete({ where: { id } });
}
