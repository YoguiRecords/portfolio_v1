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

export type ContactInput = z.infer<typeof ContactInput>;
export type AppointmentInput = z.infer<typeof AppointmentInput>;
