import type { PrismaClient } from "@portfolio/db";
import { blockSchemas, ReorderItem, type ProjectBlockKind } from "@portfolio/core";

type BlockType = ProjectBlockKind;

/**
 * Project block actions (write side, `app_admin`). The block `data` is validated
 * against the block type's Zod schema — symmetric with the public renderer (P3),
 * so the admin can never store a payload the site would reject.
 */

/** Appends an empty block of the given type at the end of the project's list. */
export async function addBlock(prisma: PrismaClient, projectId: string, type: BlockType) {
  if (!blockSchemas[type]) throw new Error(`unknown block type: ${type}`);
  const last = await prisma.projectBlock.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return prisma.projectBlock.create({
    data: { projectId, type, order: (last?.order ?? -1) + 1, data: {} },
  });
}

/** Validates and stores a block's payload against its type schema. */
export async function updateBlock(prisma: PrismaClient, id: string, rawData: unknown) {
  const block = await prisma.projectBlock.findUnique({ where: { id }, select: { type: true } });
  if (!block) throw new Error("block not found");
  const schema = blockSchemas[block.type as BlockType];
  if (!schema) throw new Error(`unknown block type: ${block.type}`);
  const data = schema.parse(rawData);
  return prisma.projectBlock.update({ where: { id }, data: { data } });
}

/** Persists a new ordering for a set of blocks. */
export async function reorderBlocks(prisma: PrismaClient, raw: unknown) {
  const items = ReorderItem.array().parse(raw);
  await prisma.$transaction(
    items.map((it) =>
      prisma.projectBlock.update({ where: { id: it.id }, data: { order: it.order } }),
    ),
  );
}

/** Toggles a block's visibility. */
export function toggleBlockVisible(prisma: PrismaClient, id: string, isVisible: boolean) {
  return prisma.projectBlock.update({ where: { id }, data: { isVisible } });
}

/** Removes a block. */
export async function deleteBlock(prisma: PrismaClient, id: string) {
  await prisma.projectBlock.delete({ where: { id } });
}
