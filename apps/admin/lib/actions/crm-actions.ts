"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { requireEnrolledSession } from "@/lib/auth/guards";
import {
  createCompany,
  updateCompany,
  deleteCompany,
  createContact,
  updateContact,
  deleteContact,
  createDeal,
  updateDeal,
  deleteDeal,
  setDealStage,
  createActivity,
  deleteActivity,
  createTask,
  updateTask,
  setTaskStatus,
  deleteTask,
} from "@/lib/crm/crm";

/** Reads an optional string FormData field (empty → undefined). */
function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}
/** Reads an optional integer FormData field. */
function int(form: FormData, key: string): number | undefined {
  const v = str(form, key);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}
function reqId(form: FormData): string | undefined {
  return str(form, "id");
}

// ── Companies ──
export async function createCompanyAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createCompany(prisma, { name: str(form, "name"), website: str(form, "website"), notes: str(form, "notes") });
  revalidatePath("/societes");
}
export async function updateCompanyAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (!id) return;
  await updateCompany(prisma, id, { name: str(form, "name"), website: str(form, "website"), notes: str(form, "notes") });
  revalidatePath("/societes");
}
export async function deleteCompanyAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteCompany(prisma, id);
  revalidatePath("/societes");
}

// ── Contacts ──
function contactData(form: FormData) {
  return {
    firstName: str(form, "firstName"),
    lastName: str(form, "lastName"),
    email: str(form, "email"),
    phone: str(form, "phone"),
    role: str(form, "role"),
    source: str(form, "source"),
    status: str(form, "status") ?? "LEAD",
    ownerNotes: str(form, "ownerNotes"),
    companyId: str(form, "companyId"),
    linkedProjectId: str(form, "linkedProjectId"),
    testimonialId: str(form, "testimonialId"),
    contactMessageId: str(form, "contactMessageId"),
  };
}
export async function createContactAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createContact(prisma, contactData(form));
  revalidatePath("/contacts");
}
export async function updateContactAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (!id) return;
  await updateContact(prisma, id, contactData(form));
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
}
export async function deleteContactAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteContact(prisma, id);
  revalidatePath("/contacts");
}

// ── Deals ──
function dealData(form: FormData) {
  return {
    title: str(form, "title"),
    contactId: str(form, "contactId"),
    companyId: str(form, "companyId"),
    valueCents: int(form, "valueCents"),
    stage: str(form, "stage") ?? "PROSPECT",
    probability: int(form, "probability"),
    expectedCloseAt: str(form, "expectedCloseAt"),
  };
}
export async function createDealAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createDeal(prisma, dealData(form));
  revalidatePath("/pipeline");
}
export async function updateDealAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (!id) return;
  await updateDeal(prisma, id, dealData(form));
  revalidatePath("/pipeline");
}
export async function deleteDealAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteDeal(prisma, id);
  revalidatePath("/pipeline");
}
export async function setDealStageAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  const stage = str(form, "stage");
  if (id && stage) await setDealStage(prisma, id, stage);
  revalidatePath("/pipeline");
}

// ── Activities ──
export async function createActivityAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createActivity(prisma, {
    type: str(form, "type") ?? "NOTE",
    content: str(form, "content"),
    contactId: str(form, "contactId"),
    dealId: str(form, "dealId"),
    occurredAt: str(form, "occurredAt"),
  });
  const contactId = str(form, "contactId");
  if (contactId) revalidatePath(`/contacts/${contactId}`);
}
export async function deleteActivityAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteActivity(prisma, id);
}

// ── Tasks (unified todo) ──
function taskData(form: FormData) {
  return {
    title: str(form, "title"),
    description: str(form, "description"),
    category: str(form, "category") ?? "GENERAL",
    status: str(form, "status") ?? "TODO",
    priority: str(form, "priority") ?? "NORMAL",
    dueAt: str(form, "dueAt"),
    contactId: str(form, "contactId"),
    dealId: str(form, "dealId"),
  };
}
function revalidateTaskViews(form: FormData): void {
  revalidatePath("/taches");
  revalidatePath("/mission-control");
  const contactId = str(form, "contactId");
  if (contactId) revalidatePath(`/contacts/${contactId}`);
}
export async function createTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createTask(prisma, taskData(form));
  revalidateTaskViews(form);
}
export async function updateTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (!id) return;
  await updateTask(prisma, id, taskData(form));
  revalidateTaskViews(form);
}
export async function setTaskStatusAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  const status = str(form, "status");
  if (id && status) await setTaskStatus(prisma, id, status);
  revalidatePath("/taches");
  revalidatePath("/mission-control");
}
export async function deleteTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteTask(prisma, id);
  revalidatePath("/taches");
  revalidatePath("/mission-control");
}
