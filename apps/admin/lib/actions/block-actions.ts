"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { addBlock, updateBlock, deleteBlock } from "@/lib/content/project-blocks";

/** Adds an empty block of the given type to a project. */
export async function addBlockAction(projectId: string, blockType: string): Promise<void> {
  await requireEnrolledSession();
  await addBlock(prisma, projectId, blockType as Parameters<typeof addBlock>[2]);
  revalidatePath(`/projets/${projectId}`);
}

/** Validates (Zod, by block type) and stores a block's payload. */
export async function updateBlockDataAction(
  blockId: string,
  projectId: string,
  data: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireEnrolledSession();
  try {
    await updateBlock(prisma, blockId, data);
    revalidatePath(`/projets/${projectId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "invalid" };
  }
}

/** Removes a block. */
export async function deleteBlockAction(blockId: string, projectId: string): Promise<void> {
  await requireEnrolledSession();
  await deleteBlock(prisma, blockId);
  revalidatePath(`/projets/${projectId}`);
}
