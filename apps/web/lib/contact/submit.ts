import type { PrismaClient } from "@portfolio/db";
import type { ContactInput, AppointmentInput } from "@portfolio/core";

/** Request metadata captured for audit/anti-abuse (never displayed publicly). */
export interface SubmitMeta {
  ip: string | null;
  userAgent: string | null;
}

/**
 * Persists a contact message (insert-only for `app_web`; never read back on the
 * public site — PII stays in the BO inbox).
 */
export async function persistContact(
  prisma: PrismaClient,
  input: ContactInput,
  meta: SubmitMeta,
): Promise<void> {
  await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
}

/**
 * Persists an appointment request (source CONTACT, status defaults to PENDING —
 * confirmed later in the BO).
 */
export async function persistAppointment(
  prisma: PrismaClient,
  input: AppointmentInput,
  meta: SubmitMeta,
): Promise<void> {
  await prisma.appointmentRequest.create({
    data: {
      name: input.name,
      email: input.email,
      topic: input.topic,
      message: input.message,
      requestedAt: input.requestedAt,
      source: "CONTACT",
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
}
