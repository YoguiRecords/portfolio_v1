import type { Mailbox, SendMailInput } from "@portfolio/core/integrations";

/**
 * Plain-text email builders for the booking lifecycle. Pure templating: the
 * caller passes an already-formatted `whenLabel` (locale/timezone formatting
 * happens at the edge), so these are trivially testable and never touch `Intl`.
 * All bodies are plain text — no remote HTML rendering surface.
 */

const SIGN = "\n\n— Friday, e-secrétaire de Yohan Debusscher";

/** Email sent to the visitor when a booking request is received (PENDING). */
export function requestReceivedEmail(a: {
  firstName: string;
  email: string;
  whenLabel: string;
  cancelUrl: string;
}): SendMailInput {
  return {
    to: a.email,
    subject: "Votre demande de rendez-vous a bien été reçue",
    body:
      `Bonjour ${a.firstName},\n\n` +
      `Votre demande de rendez-vous pour le ${a.whenLabel} a bien été enregistrée.\n` +
      `Yohan la validera dès que possible et vous recevrez un email de confirmation.\n\n` +
      `Besoin d'annuler ? Utilisez ce lien : ${a.cancelUrl}` +
      SIGN,
  };
}

/** Email sent to the visitor when Yohan confirms the appointment. */
export function confirmedEmail(a: {
  firstName: string;
  email: string;
  whenLabel: string;
  joinInfo: string;
  cancelUrl: string;
}): SendMailInput {
  const join = a.joinInfo.trim() ? `\nLien / lieu : ${a.joinInfo.trim()}\n` : "";
  return {
    to: a.email,
    subject: "Votre rendez-vous est confirmé",
    body:
      `Bonjour ${a.firstName},\n\n` +
      `Bonne nouvelle : votre rendez-vous du ${a.whenLabel} est confirmé.\n` +
      join +
      `\nBesoin d'annuler ? Utilisez ce lien : ${a.cancelUrl}` +
      SIGN,
  };
}

/** Email sent to the visitor when the appointment is cancelled or declined. */
export function cancelledEmail(a: {
  firstName: string;
  email: string;
  whenLabel: string;
}): SendMailInput {
  return {
    to: a.email,
    subject: "Votre rendez-vous a été annulé",
    body:
      `Bonjour ${a.firstName},\n\n` +
      `Votre rendez-vous du ${a.whenLabel} a été annulé.\n` +
      `N'hésitez pas à en reprendre un autre quand vous le souhaitez.` +
      SIGN,
  };
}

/**
 * Best-effort send: never throws. Booking must succeed even if the mailbox is
 * unavailable (Microsoft Graph not connected, transient error…); the failure is
 * logged and swallowed.
 */
export async function sendBookingEmail(mailbox: Mailbox, input: SendMailInput): Promise<void> {
  try {
    await mailbox.sendMessage(input);
  } catch (error) {
    console.error("[booking] email skipped (mailbox unavailable?):", error);
  }
}
