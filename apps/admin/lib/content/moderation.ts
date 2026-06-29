import { z } from "zod";
import type { PrismaClient } from "@portfolio/db";
import type { CreateEventInput } from "@portfolio/core/integrations";

/** Minimal calendar writer (subset of CalendarProvider) — injectable for tests. */
export interface CalendarWriter {
  createEvent(input: CreateEventInput): Promise<void>;
}

/**
 * Moderation & inbox operations (write side, `app_admin` only). Testimonials,
 * contact messages and appointment requests are never readable by the public
 * `app_web` role — they live entirely in the back office.
 */

const contentSchema = z.string().min(1).max(1000);

// ── Testimonials ──────────────────────────────────────────────────────────
export function listTestimonials(prisma: PrismaClient) {
  return prisma.testimonial.findMany({ orderBy: [{ status: "asc" }, { order: "asc" }] });
}

/** Approves a testimonial (visible publicly) and stamps `approvedAt`. */
export function approveTestimonial(prisma: PrismaClient, id: string) {
  return prisma.testimonial.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
}

/** Rejects a testimonial (never displayed). */
export function rejectTestimonial(prisma: PrismaClient, id: string) {
  return prisma.testimonial.update({ where: { id }, data: { status: "REJECTED" } });
}

/** Edits the displayed `content` only — `submittedContent` (audit) is untouched. */
export function editTestimonialContent(prisma: PrismaClient, id: string, content: unknown) {
  return prisma.testimonial.update({
    where: { id },
    data: { content: contentSchema.parse(content) },
  });
}

/** Toggles a testimonial's featured flag. */
export function featureTestimonial(prisma: PrismaClient, id: string, isFeatured: boolean) {
  return prisma.testimonial.update({ where: { id }, data: { isFeatured } });
}

// ── Contact inbox ─────────────────────────────────────────────────────────
export function listMessages(prisma: PrismaClient) {
  return prisma.contactMessage.findMany({ orderBy: [{ isRead: "asc" }, { createdAt: "desc" }] });
}

export function markMessageRead(prisma: PrismaClient, id: string, isRead = true) {
  return prisma.contactMessage.update({ where: { id }, data: { isRead } });
}

export function markMessageSpam(prisma: PrismaClient, id: string, isSpam = true) {
  return prisma.contactMessage.update({ where: { id }, data: { isSpam } });
}

// ── Appointment requests ──────────────────────────────────────────────────
export function listAppointments(prisma: PrismaClient) {
  return prisma.appointmentRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export function confirmAppointment(prisma: PrismaClient, id: string) {
  return prisma.appointmentRequest.update({ where: { id }, data: { status: "CONFIRMED" } });
}

/**
 * Confirms an appointment **and** best-effort creates a calendar event for the
 * requested slot (default 30 min). The calendar write is non-blocking: if no
 * writable provider is connected (e.g. Microsoft Graph absent), the confirmation
 * still succeeds — the event is simply skipped (logged), never throwing.
 */
export async function confirmAppointmentWithEvent(
  prisma: PrismaClient,
  calendar: CalendarWriter,
  id: string,
): Promise<void> {
  const appt = await prisma.appointmentRequest.findUnique({ where: { id } });
  if (!appt) return;
  await prisma.appointmentRequest.update({ where: { id }, data: { status: "CONFIRMED" } });
  if (!appt.requestedAt) return;
  const start = appt.requestedAt;
  const end = new Date(start.getTime() + 30 * 60_000);
  try {
    await calendar.createEvent({
      title: `RDV — ${appt.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
      location: appt.topic ?? undefined,
    });
  } catch (error) {
    console.error("[confirmAppointment] calendar event skipped (no writable calendar?):", error);
  }
}

export function declineAppointment(prisma: PrismaClient, id: string) {
  return prisma.appointmentRequest.update({ where: { id }, data: { status: "DECLINED" } });
}
