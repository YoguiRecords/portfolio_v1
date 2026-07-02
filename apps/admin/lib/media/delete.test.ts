// @vitest-environment node
import { afterAll, beforeEach, expect, test, vi } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { deleteMediaAsset, objectNameFromUrl } from "./delete";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

function ports() {
  return { prisma, removeObject: vi.fn(async () => undefined) };
}

async function createAsset() {
  return prisma.mediaAsset.create({
    data: {
      url: "http://localhost:9100/media/abc123.webp",
      originalName: "abc.png",
      mimeType: "image/webp",
      sizeBytes: 10,
      kind: "IMAGE",
    },
  });
}

test("deleteMediaAsset supprime la ligne DB et l'objet MinIO quand rien ne l'utilise", async () => {
  // Arrange
  const asset = await createAsset();
  const p = ports();

  // Act
  const result = await deleteMediaAsset(p, asset.id);

  // Assert
  expect(result).toEqual({ ok: true });
  expect(await prisma.mediaAsset.findUnique({ where: { id: asset.id } })).toBeNull();
  expect(p.removeObject).toHaveBeenCalledWith("abc123.webp");
});

test("deleteMediaAsset refuse quand le média est utilisé (avatar de profil)", async () => {
  // Arrange
  const asset = await createAsset();
  await prisma.profile.create({
    data: { fullName: "Yohan", headline: "h", bio: "b", email: "y@x.z", avatarId: asset.id },
  });
  const p = ports();

  // Act
  const result = await deleteMediaAsset(p, asset.id);

  // Assert
  expect(result).toEqual({ ok: false, reason: "in_use", usage: ["profil (avatar)"] });
  expect(await prisma.mediaAsset.findUnique({ where: { id: asset.id } })).not.toBeNull();
  expect(p.removeObject).not.toHaveBeenCalled();
});

test("deleteMediaAsset renvoie not_found pour un id inconnu", async () => {
  const result = await deleteMediaAsset(ports(), "nope");
  expect(result).toEqual({ ok: false, reason: "not_found" });
});

test("objectNameFromUrl extrait le nom d'objet", () => {
  expect(objectNameFromUrl("http://x/media/a.webp")).toBe("a.webp");
  expect(objectNameFromUrl("")).toBeNull();
});
