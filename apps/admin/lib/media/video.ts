import type { PrismaClient } from "@portfolio/db";

/** Input for a hosted video or external embed (no webp conversion). */
export interface VideoInput {
  externalUrl: string;
  kind: "VIDEO" | "EMBED";
  provider?: string;
  posterUrl?: string;
  durationSec?: number;
  alt?: string;
}

/**
 * Registers a video / embed as a `MediaAsset` (bypasses the webp pipeline). The
 * source URL must be http(s) (no `javascript:`/`data:` vectors).
 */
export async function addVideo(prisma: PrismaClient, input: VideoInput) {
  if (!/^https?:\/\//i.test(input.externalUrl.trim())) {
    throw new Error("video_invalid_url");
  }
  return prisma.mediaAsset.create({
    data: {
      url: input.externalUrl,
      externalUrl: input.externalUrl,
      provider: input.provider,
      posterUrl: input.posterUrl,
      durationSec: input.durationSec,
      alt: input.alt,
      kind: input.kind,
      originalName: input.provider ?? input.kind.toLowerCase(),
      mimeType: input.kind === "EMBED" ? "text/html" : "video/mp4",
      sizeBytes: 0,
    },
  });
}
