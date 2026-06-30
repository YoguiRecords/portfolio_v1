import type { PrismaClient } from "@portfolio/db";
import { ActivityInput, CompanyInput, CrmContactInput, TaskInput, TASK_STATUSES, DealInput, DEAL_STAGES } from "@portfolio/core";

/**
 * CRM persistence (write side, `app_admin` only). All inputs validated with Zod
 * at the boundary; the public `app_web` role has no access to these tables
 * (REVOKE in the migration).
 */

// ── Companies ──
export function listCompanies(prisma: PrismaClient) {
  return prisma.company.findMany({ orderBy: { name: "asc" } });
}
export async function createCompany(prisma: PrismaClient, raw: unknown) {
  return prisma.company.create({ data: CompanyInput.parse(raw) });
}
export async function updateCompany(prisma: PrismaClient, id: string, raw: unknown) {
  return prisma.company.update({ where: { id }, data: CompanyInput.parse(raw) });
}
export async function deleteCompany(prisma: PrismaClient, id: string) {
  await prisma.company.delete({ where: { id } });
}

// ── Contacts ──
export function listContacts(prisma: PrismaClient) {
  return prisma.contact.findMany({ orderBy: { createdAt: "desc" }, include: { company: true } });
}
export function getContact(prisma: PrismaClient, id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: { company: true, deals: true, activities: { orderBy: { occurredAt: "desc" } }, tasks: true },
  });
}
export async function createContact(prisma: PrismaClient, raw: unknown) {
  return prisma.contact.create({ data: CrmContactInput.parse(raw) });
}
export async function updateContact(prisma: PrismaClient, id: string, raw: unknown) {
  return prisma.contact.update({ where: { id }, data: CrmContactInput.parse(raw) });
}
export async function deleteContact(prisma: PrismaClient, id: string) {
  await prisma.contact.delete({ where: { id } });
}

// ── Deals ──
export function listDeals(prisma: PrismaClient) {
  return prisma.deal.findMany({ orderBy: { createdAt: "desc" }, include: { contact: true, company: true } });
}
export async function createDeal(prisma: PrismaClient, raw: unknown) {
  return prisma.deal.create({ data: DealInput.parse(raw) });
}
export async function updateDeal(prisma: PrismaClient, id: string, raw: unknown) {
  return prisma.deal.update({ where: { id }, data: DealInput.parse(raw) });
}
export async function deleteDeal(prisma: PrismaClient, id: string) {
  await prisma.deal.delete({ where: { id } });
}
/** Moves a deal to another pipeline stage (validated against the known stages). */
export async function setDealStage(prisma: PrismaClient, id: string, stage: string) {
  if (!(DEAL_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid_stage: ${stage}`);
  }
  return prisma.deal.update({ where: { id }, data: { stage: stage as (typeof DEAL_STAGES)[number] } });
}

// ── Activities ──
export async function createActivity(prisma: PrismaClient, raw: unknown) {
  return prisma.activity.create({ data: ActivityInput.parse(raw) });
}
export async function deleteActivity(prisma: PrismaClient, id: string) {
  await prisma.activity.delete({ where: { id } });
}

// ── Tasks (unified todo) ──
export function listTasks(prisma: PrismaClient) {
  return prisma.task.findMany({
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    include: { contact: true },
  });
}
export async function createTask(prisma: PrismaClient, raw: unknown) {
  return prisma.task.create({ data: TaskInput.parse(raw) });
}
export async function updateTask(prisma: PrismaClient, id: string, raw: unknown) {
  return prisma.task.update({ where: { id }, data: TaskInput.parse(raw) });
}
/** Moves a task to another kanban column (validated against the known statuses). */
export async function setTaskStatus(prisma: PrismaClient, id: string, status: string) {
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid_status: ${status}`);
  }
  return prisma.task.update({ where: { id }, data: { status: status as (typeof TASK_STATUSES)[number] } });
}
export async function deleteTask(prisma: PrismaClient, id: string) {
  await prisma.task.delete({ where: { id } });
}
