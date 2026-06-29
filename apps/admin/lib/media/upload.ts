import type { PrismaClient } from "@portfolio/db";
import { validateUpload } from "@portfolio/core";

/** A converted webp result from the image-processor. */
export interface ConvertedImage {
  data: Buffer;
  width?: number;
  height?: number;
}

/** External effects of the upload pipeline (mocked in tests). */
export interface UploadPorts {
  /** Re-encodes an image to webp + strips EXIF (image-processor service). */
  convertToWebp(buffer: Buffer, mimeType: string): Promise<ConvertedImage>;
  /** Stores an object in MinIO, returns its public URL. */
  putObject(name: string, data: Buffer, contentType: string): Promise<string>;
  /** Random, non-guessable object base name (no extension). */
  randomName(): string;
  prisma: PrismaClient;
}

/** The raw uploaded file. */
export interface UploadFile {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
  width?: number;
  height?: number;
}

/**
 * Secure image upload pipeline: validate → re-encode to webp (strip EXIF) →
 * store in MinIO under a random name → record a `MediaAsset`. The side effects
 * are injected as ports so the orchestration is unit-testable.
 *
 * @throws Error `upload_invalid:<code>` when validation fails.
 */
export async function uploadImage(ports: UploadPorts, file: UploadFile, alt?: string) {
  const validation = validateUpload({
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    width: file.width,
    height: file.height,
  });
  if (!validation.ok) throw new Error(`upload_invalid:${validation.error}`);

  const webp = await ports.convertToWebp(file.buffer, file.mimeType);
  const name = `${ports.randomName()}.webp`;
  const url = await ports.putObject(name, webp.data, "image/webp");

  return ports.prisma.mediaAsset.create({
    data: {
      url,
      alt,
      originalName: file.originalName,
      mimeType: "image/webp",
      sizeBytes: webp.data.length,
      width: webp.width,
      height: webp.height,
      kind: "IMAGE",
    },
  });
}
