"use server";

import { revalidatePath } from "next/cache";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { uploadImage } from "@/lib/media/upload";
import { buildPorts } from "@/lib/media/ports";

/**
 * Uploads an image through the secure pipeline (validate → webp/EXIF strip via
 * image-processor → MinIO → MediaAsset). Server-only.
 */
export async function uploadImageAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
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
