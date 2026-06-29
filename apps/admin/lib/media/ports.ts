import { Client } from "minio";
import { randomBytes } from "node:crypto";
import { prisma } from "@portfolio/db";
import type { ConvertedImage, UploadPorts } from "./upload";

/**
 * Real implementations of the upload ports, wired to the internal
 * `image-processor` service and MinIO. Everything stays server-side; the browser
 * never touches MinIO or the converter (cf. STACK_SECURITY).
 */

const PROCESSOR_URL = process.env.IMAGE_PROCESSOR_URL ?? "http://image-processor:5050";
const MEDIA_BASE = process.env.MEDIA_PUBLIC_BASE_URL ?? "http://localhost:9100/media";
const BUCKET = process.env.MINIO_BUCKET ?? "media";

/** Re-encodes to webp (strips EXIF) via the image-processor `/convert` endpoint. */
async function convertToWebp(buffer: Buffer, mimeType: string): Promise<ConvertedImage> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), "upload");
  const res = await fetch(`${PROCESSOR_URL}/convert`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`convert_failed:${res.status}`);
  return { data: Buffer.from(await res.arrayBuffer()) };
}

function minioClient(): Client {
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "minio",
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? process.env.MINIO_ROOT_USER ?? "",
    secretKey: process.env.MINIO_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "",
  });
}

/** Stores an object in the public `media` bucket, returns its public URL. */
async function putObject(name: string, data: Buffer, contentType: string): Promise<string> {
  await minioClient().putObject(BUCKET, name, data, data.length, { "Content-Type": contentType });
  return `${MEDIA_BASE}/${name}`;
}

/** Builds the production upload ports (image-processor + MinIO + Prisma). */
export function buildPorts(): UploadPorts {
  return {
    convertToWebp,
    putObject,
    randomName: () => randomBytes(12).toString("hex"),
    prisma,
  };
}
