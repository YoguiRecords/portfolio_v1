"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { getMailbox } from "@/lib/integrations/factory";

const SendMailSchema = z.object({
  to: z.string().email().max(160),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

/** Marks a mailbox message read/unread. */
export async function markMailReadAction(id: string, isRead: boolean): Promise<void> {
  await requireEnrolledSession();
  await getMailbox().markRead(id, isRead);
  revalidatePath("/mails");
}

/** Sends a reply/new message from the connected mailbox (validated with Zod). */
export async function sendMailAction(
  _prev: { ok: boolean; error?: string },
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireEnrolledSession();
  const parsed = SendMailSchema.safeParse({
    to: formData.get("to"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { ok: false, error: "Champs invalides." };

  try {
    await getMailbox().sendMessage(parsed.data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Échec de l'envoi." };
  }
}
