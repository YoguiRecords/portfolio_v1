import { z } from "zod";
import type { PrismaClient } from "@portfolio/db";

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

export function declineAppointment(prisma: PrismaClient, id: string) {
  return prisma.appointmentRequest.update({ where: { id }, data: { status: "DECLINED" } });
}
