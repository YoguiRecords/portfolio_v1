"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import {
  approveTestimonial,
  rejectTestimonial,
  editTestimonialContent,
  featureTestimonial,
  markMessageRead,
  markMessageSpam,
  confirmAppointmentWithEvent,
  declineAppointment,
  cancelAppointment,
} from "@/lib/content/moderation";
import { getCalendar, getMailbox } from "@/lib/integrations/factory";

function id(form: FormData): string | undefined {
  const v = form.get("id");
  return typeof v === "string" && v ? v : undefined;
}

export async function approveTestimonialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("testimonials"));
  const i = id(form);
  if (i) await approveTestimonial(prisma, i);
  revalidatePath("/temoignages");
}
export async function rejectTestimonialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("testimonials"));
  const i = id(form);
  if (i) await rejectTestimonial(prisma, i);
  revalidatePath("/temoignages");
}
export async function editTestimonialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("testimonials"));
  const i = id(form);
  const content = form.get("content");
  if (i && typeof content === "string") await editTestimonialContent(prisma, i, content);
  revalidatePath("/temoignages");
}
export async function featureTestimonialAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("testimonials"));
  const i = id(form);
  if (i) await featureTestimonial(prisma, i, form.get("isFeatured") === "true");
  revalidatePath("/temoignages");
}

export async function markMessageReadAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("inbox"));
  const i = id(form);
  if (i) await markMessageRead(prisma, i);
  revalidatePath("/messages");
}
export async function markMessageSpamAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("inbox"));
  const i = id(form);
  if (i) await markMessageSpam(prisma, i);
  revalidatePath("/messages");
}

export async function confirmAppointmentAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("appointments"));
  const i = id(form);
  const joinRaw = form.get("joinInfo");
  const joinInfo = typeof joinRaw === "string" ? joinRaw : "";
  if (i) await confirmAppointmentWithEvent(prisma, getCalendar(), getMailbox(), i, joinInfo);
  revalidatePath("/rdv");
  revalidatePath("/calendrier");
}
export async function declineAppointmentAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("appointments"));
  const i = id(form);
  if (i) await declineAppointment(prisma, getMailbox(), i);
  revalidatePath("/rdv");
  revalidatePath("/calendrier");
}
export async function cancelAppointmentAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("appointments"));
  const i = id(form);
  if (i) await cancelAppointment(prisma, getMailbox(), i);
  revalidatePath("/rdv");
  revalidatePath("/calendrier");
}
