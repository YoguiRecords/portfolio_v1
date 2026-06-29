import type { PrismaClient } from "@portfolio/db";
import { expect, test, vi } from "vitest";
import { createContact, setDealStage } from "./crm";

test("createContact : crée un contact valide (statut LEAD par défaut)", async () => {
  const create = vi.fn().mockResolvedValue({ id: "1" });
  const prisma = { contact: { create } } as unknown as PrismaClient;
  await createContact(prisma, { firstName: "Alice", email: "alice@x.test" });
  expect(create).toHaveBeenCalledWith({
    data: expect.objectContaining({ firstName: "Alice", status: "LEAD" }),
  });
});

test("createContact : rejette une entrée invalide (email)", async () => {
  const prisma = { contact: { create: vi.fn() } } as unknown as PrismaClient;
  await expect(createContact(prisma, { firstName: "Alice", email: "bad" })).rejects.toThrow();
});

test("setDealStage : rejette un stage inconnu", async () => {
  const prisma = { deal: { update: vi.fn() } } as unknown as PrismaClient;
  await expect(setDealStage(prisma, "1", "NOPE")).rejects.toThrow("invalid_stage");
});
