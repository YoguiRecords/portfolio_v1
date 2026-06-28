"use server";

/**
 * TOTP enrolment Server Action.
 *
 * The secret is generated and shown (as a QR) on the enrolment page, carried
 * back in a hidden field, and only persisted here once the admin proves they
 * can produce a valid code — so a half-finished enrolment never locks the
 * account out.
 */
import { redirect } from "next/navigation";
import { verifyTotp } from "@portfolio/core";
import { prisma } from "@portfolio/db";
import { requireActiveSession } from "./guards";
import { totpCodeSchema } from "./schema";

/** Generic error for an invalid enrolment code. */
const GENERIC_TOTP_ERROR = "Code invalide.";

/** State returned by {@link confirmTotpEnrolmentAction}. */
export interface TotpEnrolState {
  error?: string;
}

/**
 * Verifies the enrolment code against the proposed secret and, on success,
 * enables TOTP for the current admin.
 *
 * @param _prev - Previous action state (unused).
 * @param formData - Submitted form data (`secret`, `code`).
 * @returns A {@link TotpEnrolState} with a generic error, or redirects on success.
 */
export async function confirmTotpEnrolmentAction(
  _prev: TotpEnrolState,
  formData: FormData,
): Promise<TotpEnrolState> {
  const session = await requireActiveSession();

  const secret = String(formData.get("secret") ?? "");
  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") });
  if (!secret || !parsed.success || !(await verifyTotp(parsed.data.code, secret))) {
    return { error: GENERIC_TOTP_ERROR };
  }

  await prisma.adminUser.update({
    where: { id: session.adminUser.id },
    data: { totpSecret: secret, isTotpEnabled: true },
  });

  redirect("/");
}
