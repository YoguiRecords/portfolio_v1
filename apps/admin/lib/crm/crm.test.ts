import type { PrismaClient } from "@portfolio/db";
import { expect, test, vi } from "vitest";
import { createContact, setDealStage, createTask, setTaskStatus } from "./crm";

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

test("createTask : applique les défauts (GENERAL/TODO/NORMAL)", async () => {
  const create = vi.fn().mockResolvedValue({ id: "t1" });
  const prisma = { task: { create } } as unknown as PrismaClient;
  await createTask(prisma, { title: "Créer facture" });
  expect(create).toHaveBeenCalledWith({
    data: expect.objectContaining({ category: "GENERAL", status: "TODO", priority: "NORMAL" }),
  });
});

test("createTask : rejette un titre vide", async () => {
  const prisma = { task: { create: vi.fn() } } as unknown as PrismaClient;
  await expect(createTask(prisma, { title: "" })).rejects.toThrow();
});

test("setTaskStatus : rejette un statut inconnu", async () => {
  const prisma = { task: { update: vi.fn() } } as unknown as PrismaClient;
  await expect(setTaskStatus(prisma, "t1", "NOPE")).rejects.toThrow("invalid_status");
});

test("setTaskStatus : met à jour avec un statut valide", async () => {
  const update = vi.fn().mockResolvedValue({ id: "t1" });
  const prisma = { task: { update } } as unknown as PrismaClient;
  await setTaskStatus(prisma, "t1", "IN_PROGRESS");
  expect(update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { status: "IN_PROGRESS" } });
});
