"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { uploadImage } from "@/lib/media/upload";
import { buildPorts, removeObject } from "@/lib/media/ports";
import { deleteMediaAsset } from "@/lib/media/delete";

/**
 * Uploads an image through the secure pipeline (validate → webp/EXIF strip via
 * image-processor → MinIO → MediaAsset). Server-only.
 */
export async function uploadImageAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("media"));
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const alt = typeof form.get("alt") === "string" ? (form.get("alt") as string) : undefined;
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadImage(
    buildPorts(),
    { buffer, mimeType: file.type, sizeBytes: file.size, originalName: file.name },
    alt,
  );
  revalidatePath("/media");
}

/** Feedback returned to the media panel after a delete attempt. */
export type DeleteMediaState = { ok?: boolean; error?: string };

/**
 * Deletes a media asset (usage-guarded): refused with an explicit message while
 * any content still references it; otherwise removes the DB row + MinIO object.
 */
export async function deleteMediaAction(
  _prev: DeleteMediaState,
  form: FormData,
): Promise<DeleteMediaState> {
  assertCanWrite(await requirePermission("media"));
  const id = form.get("id");
  if (typeof id !== "string" || !id) return { error: "Média introuvable." };

  const result = await deleteMediaAsset({ prisma, removeObject }, id);
  if (!result.ok) {
    if (result.reason === "in_use") {
      return { error: `Média utilisé par : ${result.usage.join(", ")}. Retirez-le de ces contenus d'abord.` };
    }
    return { error: "Média introuvable." };
  }
  revalidatePath("/media");
  return { ok: true };
}
