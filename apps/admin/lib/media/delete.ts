import type { PrismaClient } from "@portfolio/db";

/** Storage side-effect of the deletion (mocked in tests). */
export interface DeleteMediaPorts {
  /** Removes the object from the media bucket (best-effort). */
  removeObject(objectName: string): Promise<void>;
  prisma: PrismaClient;
}

/** Human-readable usage labels, shown when the deletion is refused. */
export type MediaUsage =
  | "profil (avatar)"
  | "témoignage (avatar)"
  | "projet (couverture/OG/galerie)"
  | "article (couverture/OG/média)"
  | "évènement (couverture/média)"
  | "réglages du site (OG)";

export type DeleteMediaResult =
  | { ok: true }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "in_use"; usage: MediaUsage[] };

/**
 * Lists every content object still referencing the asset. The deletion is
 * refused while this is non-empty: removing a media out from under a published
 * page would silently break it.
 */
async function collectUsage(prisma: PrismaClient, id: string): Promise<MediaUsage[]> {
  const [profile, testimonial, project, projectImage, article, articleMedia, event, eventMedia, settings] =
    await Promise.all([
      prisma.profile.count({ where: { avatarId: id } }),
      prisma.testimonial.count({ where: { avatarId: id } }),
      prisma.project.count({ where: { OR: [{ coverId: id }, { ogImageId: id }] } }),
      prisma.projectImage.count({ where: { imageId: id } }),
      prisma.article.count({ where: { OR: [{ coverId: id }, { ogImageId: id }] } }),
      prisma.articleMedia.count({ where: { mediaId: id } }),
      prisma.event.count({ where: { coverId: id } }),
      prisma.eventMedia.count({ where: { mediaId: id } }),
      prisma.siteSettings.count({ where: { ogImageId: id } }),
    ]);

  const usage: MediaUsage[] = [];
  if (profile) usage.push("profil (avatar)");
  if (testimonial) usage.push("témoignage (avatar)");
  if (project || projectImage) usage.push("projet (couverture/OG/galerie)");
  if (article || articleMedia) usage.push("article (couverture/OG/média)");
  if (event || eventMedia) usage.push("évènement (couverture/média)");
  if (settings) usage.push("réglages du site (OG)");
  return usage;
}

/** Extracts the bucket object name from the stored public URL. */
export function objectNameFromUrl(url: string): string | null {
  const name = url.split("/").pop();
  return name && name.length > 0 ? name : null;
}

/**
 * Deletes a media asset: refused while any content references it (usage guard),
 * otherwise removes the DB row then the MinIO object (best-effort — an orphan
 * object is harmless, the reverse would 404 a published page).
 */
export async function deleteMediaAsset(ports: DeleteMediaPorts, id: string): Promise<DeleteMediaResult> {
  const asset = await ports.prisma.mediaAsset.findUnique({ where: { id }, select: { id: true, url: true } });
  if (!asset) return { ok: false, reason: "not_found" };

  const usage = await collectUsage(ports.prisma, id);
  if (usage.length > 0) return { ok: false, reason: "in_use", usage };

  await ports.prisma.mediaAsset.delete({ where: { id } });

  const objectName = objectNameFromUrl(asset.url);
  if (objectName) {
    await ports.removeObject(objectName).catch(() => undefined);
  }
  return { ok: true };
}
