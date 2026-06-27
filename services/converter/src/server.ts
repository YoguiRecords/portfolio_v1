/**
 * Image converter service.
 *
 * Internal HTTP service (never exposed publicly). Accepts an uploaded image and
 * returns an optimized **webp**, re-encoded from scratch — which neutralizes most
 * embedded payloads and strips EXIF/metadata (sharp drops metadata by default;
 * `.rotate()` applies then removes the EXIF orientation tag).
 *
 * Called server-side by the back office during the upload pipeline.
 */
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import sharp from "sharp";

const PORT = Number(process.env.PORT ?? 5050);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES ?? 15 * 1024 * 1024);
const MAX_DIMENSION = Number(process.env.MAX_DIMENSION ?? 6000);
const DEFAULT_QUALITY = 82;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
]);

// Bound resource usage (anti decompression-bomb / DoS).
sharp.cache(false);
sharp.concurrency(1);

const app = Fastify({ logger: true });

await app.register(multipart, {
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 5 },
});

app.get("/health", async () => ({ status: "ok" }));

app.post("/convert", async (request, reply) => {
  const file = await request.file();
  if (!file) {
    return reply.code(400).send({ error: "no file provided (field 'file')" });
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return reply.code(415).send({ error: `unsupported type: ${file.mimetype}` });
  }

  let input: Buffer;
  try {
    input = await file.toBuffer();
  } catch {
    // @fastify/multipart throws once the fileSize limit is exceeded.
    return reply.code(413).send({ error: "file too large" });
  }

  const query = request.query as { quality?: string; width?: string };
  const quality = clampQuality(query.quality);
  const width = parseWidth(query.width);

  try {
    const pipeline = sharp(input, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION });
    const meta = await pipeline.metadata();
    if ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION) {
      return reply.code(422).send({ error: "image dimensions exceed limit" });
    }

    let img = pipeline.rotate();
    if (width) {
      img = img.resize({ width, withoutEnlargement: true });
    }

    const { data, info } = await img.webp({ quality }).toBuffer({ resolveWithObject: true });

    return reply
      .header("Content-Type", "image/webp")
      .header("X-Image-Width", String(info.width))
      .header("X-Image-Height", String(info.height))
      .header("X-Image-Size", String(info.size))
      .send(data);
  } catch (error) {
    request.log.error({ error }, "conversion failed");
    return reply.code(422).send({ error: "invalid or unprocessable image" });
  }
});

function clampQuality(raw: string | undefined): number {
  const q = Number(raw);
  if (!Number.isFinite(q)) return DEFAULT_QUALITY;
  return Math.min(100, Math.max(1, Math.round(q)));
}

function parseWidth(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const w = Number(raw);
  if (!Number.isFinite(w) || w <= 0) return undefined;
  return Math.min(MAX_DIMENSION, Math.round(w));
}

try {
  await app.listen({ host: "0.0.0.0", port: PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
