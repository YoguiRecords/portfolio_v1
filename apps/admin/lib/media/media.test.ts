// @vitest-environment node
import { afterAll, beforeEach, expect, test, vi } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { uploadImage, type UploadPorts } from "./upload";
import { addVideo } from "./video";
import { createArticle } from "../content/article";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

function ports(): UploadPorts {
  return {
    convertToWebp: vi.fn(async () => ({ data: Buffer.from("webp-bytes"), width: 800, height: 600 })),
    putObject: vi.fn(async (name: string) => `http://minio/media/${name}`),
    randomName: () => "abc123",
    prisma,
  };
}

test("uploadImage : flux nominal crée un MediaAsset webp", async () => {
  const p = ports();
  const asset = await uploadImage(p, {
    buffer: Buffer.from("jpeg"),
    mimeType: "image/jpeg",
    sizeBytes: 1000,
    originalName: "photo.jpg",
  });
  expect(asset.kind).toBe("IMAGE");
  expect(asset.mimeType).toBe("image/webp");
  expect(asset.url).toBe("http://minio/media/abc123.webp");
  expect(p.convertToWebp).toHaveBeenCalledOnce();
  expect(p.putObject).toHaveBeenCalledOnce();
});

test("uploadImage : mime invalide rejeté avant tout effet", async () => {
  const p = ports();
  await expect(
    uploadImage(p, { buffer: Buffer.from("x"), mimeType: "application/pdf", sizeBytes: 10, originalName: "x.pdf" }),
  ).rejects.toThrow(/upload_invalid:mime_not_allowed/);
  expect(p.convertToWebp).not.toHaveBeenCalled();
});

test("addVideo : enregistre un EMBED (URL http) et rejette une URL non http", async () => {
  const asset = await addVideo(prisma, { externalUrl: "https://youtube.com/embed/x", kind: "EMBED", provider: "youtube" });
  expect(asset.kind).toBe("EMBED");
  await expect(addVideo(prisma, { externalUrl: "javascript:alert(1)", kind: "EMBED" })).rejects.toThrow();
});

test("createArticle : SCHEDULED sans date est rejeté", async () => {
  const base = { title: "T", slug: "t", excerpt: "e", content: "c" };
  await expect(createArticle(prisma, { ...base, status: "SCHEDULED" })).rejects.toThrow();
  const ok = await createArticle(prisma, {
    ...base,
    status: "SCHEDULED",
    scheduledAt: "2026-12-01T10:00:00Z",
  });
  expect(ok.status).toBe("SCHEDULED");
});
