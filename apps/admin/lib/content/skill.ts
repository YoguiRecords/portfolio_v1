import type { PrismaClient } from "@portfolio/db";
import { SkillInput } from "@portfolio/core";

/** Skill persistence (write side, `app_admin`). Validated with Zod, injectable for tests. */

/** Lists skills ordered for the editor. */
export function listSkills(prisma: PrismaClient) {
  return prisma.skill.findMany({ orderBy: { order: "asc" } });
}

/** Creates a skill from validated input. */
export async function createSkill(prisma: PrismaClient, raw: unknown) {
  const data = SkillInput.parse(raw);
  return prisma.skill.create({ data });
}

/** Updates a skill (name/category/kind/showOnCv/order) from validated input. */
export async function updateSkill(prisma: PrismaClient, id: string, raw: unknown) {
  const data = SkillInput.parse(raw);
  return prisma.skill.update({ where: { id }, data });
}

/** Deletes a skill by id. */
export async function deleteSkill(prisma: PrismaClient, id: string) {
  await prisma.skill.delete({ where: { id } });
}
