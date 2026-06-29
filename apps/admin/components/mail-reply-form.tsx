"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { sendMailAction } from "@/lib/actions/mail-actions";

const initialState = { ok: false } as { ok: boolean; error?: string };

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Reply composer (client island → sendMailAction via Microsoft Graph). */
export function MailReplyForm({ to, subject }: { to: string; subject: string }) {
  const [state, formAction, pending] = useActionState(sendMailAction, initialState);

  if (state.ok) {
    return <p className="text-sm text-ok">Réponse envoyée ✓</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-ink-2">Répondre</h2>
      <input type="hidden" name="to" value={to} />
      <label className="flex flex-col gap-1 text-xs text-muted">
        Objet
        <input name="subject" defaultValue={subject} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Message
        <textarea name="body" required rows={6} className={inputCls} />
      </label>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button variant="primary" type="submit" disabled={pending} className="self-start">
        {pending ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
