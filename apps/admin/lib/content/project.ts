import type { PrismaClient } from "@portfolio/db";
import { ProjectInput } from "@portfolio/core";

/** Project header persistence (write side, `app_admin`). */

export function listProjects(prisma: PrismaClient) {
  return prisma.project.findMany({ orderBy: { order: "asc" } });
}

export async function createProject(prisma: PrismaClient, raw: unknown) {
  const data = ProjectInput.parse(raw);
  return prisma.project.create({ data });
}

export async function updateProject(prisma: PrismaClient, id: string, raw: unknown) {
  const data = ProjectInput.parse(raw);
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(prisma: PrismaClient, id: string) {
  await prisma.project.delete({ where: { id } });
}
