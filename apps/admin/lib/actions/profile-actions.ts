"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { uploadImage } from "@/lib/media/upload";
import { buildPorts } from "@/lib/media/ports";

/** Reads an optional trimmed string FormData field. */
function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

const SocialSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url().max(300),
  icon: z.string().max(40).optional(),
});

/**
 * Uploads a new avatar through the secure media pipeline (validate → webp/EXIF
 * strip → MinIO → MediaAsset) and links it to the singleton profile.
 */
export async function uploadProfileAvatarAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("profile"));
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadImage(
    buildPorts(),
    { buffer, mimeType: file.type, sizeBytes: file.size, originalName: file.name },
    "Avatar",
  );

  const profile = await prisma.profile.findFirst({ select: { id: true } });
  if (profile) {
    await prisma.profile.update({ where: { id: profile.id }, data: { avatarId: asset.id } });
  }
  revalidatePath("/profile");
  revalidatePath("/");
}

/** Adds a social link to the profile (validated with Zod). */
export async function createSocialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("profile"));
  const data = SocialSchema.parse({ label: str(form, "label"), url: str(form, "url"), icon: str(form, "icon") });
  const profile = await prisma.profile.findFirst({ select: { id: true } });
  if (!profile) return;
  const count = await prisma.socialLink.count({ where: { profileId: profile.id } });
  await prisma.socialLink.create({ data: { ...data, profileId: profile.id, order: count } });
  revalidatePath("/profile");
}

/** Removes a social link by id. */
export async function deleteSocialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("profile"));
  const id = str(form, "id");
  if (id) await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/profile");
}
