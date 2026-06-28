/**
 * Zod schemas validating auth inputs at the Server Action boundary.
 */
import { z } from "zod";

/** Validates the back office login form payload. */
export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(512),
});

/** Parsed login input. */
export type LoginInput = z.infer<typeof loginSchema>;

/** Validates a 6-digit TOTP code (login second factor / enrolment confirmation). */
export const totpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

/** Parsed TOTP code input. */
export type TotpCodeInput = z.infer<typeof totpCodeSchema>;
