import { z } from "zod";

/** Public contact form submission. Unknown keys are stripped. */
export const ContactInput = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  subject: z.string().max(150).optional(),
  message: z.string().min(10).max(2000),
});

/** Public appointment request. `requestedAt` accepts an ISO date string. */
export const AppointmentInput = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  topic: z.string().max(150).optional(),
  message: z.string().max(2000).optional(),
  requestedAt: z.coerce.date().optional(),
});

/**
 * Booking via the chatbot form: full visitor identity + phone + reason + the
 * chosen slot. Stricter than {@link AppointmentInput} (soft contact-form lead):
 * every field is required so Yohan always knows who booked and how to reach them.
 */
export const BookingInput = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(120),
  phone: z.string().min(6).max(30),
  reason: z.string().min(3).max(300),
  requestedAt: z.coerce.date(),
});

export type ContactInput = z.infer<typeof ContactInput>;
export type AppointmentInput = z.infer<typeof AppointmentInput>;
export type BookingInput = z.infer<typeof BookingInput>;
