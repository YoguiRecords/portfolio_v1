import type { PrismaClient } from "@portfolio/db";
import type { Mailbox } from "@portfolio/core/integrations";
import { cancelledEmail, sendBookingEmail } from "./emails";
import { formatSlotLabel } from "./format";

/**
 * Cancels an appointment from its self-service token (visitor-initiated).
 * Returns a generic `{ ok }` result — never reveals whether the token matched
 * an existing appointment (no enumeration). Setting status CANCELLED frees the
 * slot (the partial unique index only covers active reservations).
 */
export async function cancelByToken(
  prisma: PrismaClient,
  mailbox: Mailbox,
  token: unknown,
): Promise<{ ok: boolean }> {
  if (typeof token !== "string" || token.length === 0) return { ok: false };

  const appt = await prisma.appointmentRequest.findFirst({
    where: { cancelToken: token, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (!appt) return { ok: false };

  await prisma.appointmentRequest.update({ where: { id: appt.id }, data: { status: "CANCELLED" } });

  if (appt.requestedAt) {
    await sendBookingEmail(
      mailbox,
      cancelledEmail({
        firstName: appt.firstName ?? appt.name,
        email: appt.email,
        whenLabel: formatSlotLabel(appt.requestedAt),
      }),
    );
  }

  return { ok: true };
}
