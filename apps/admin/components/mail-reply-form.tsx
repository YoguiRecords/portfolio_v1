"use client";

import { useActionState } from "react";
import { sendMailAction } from "@/lib/actions/mail-actions";

const initialState = { ok: false } as { ok: boolean; error?: string };

/** Reply composer for a mail message (client island → sendMailAction). */
export function MailReplyForm({ to, subject }: { to: string; subject: string }) {
  const [state, formAction, pending] = useActionState(sendMailAction, initialState);

  if (state.ok) {
    return <p className="text-sm text-emerald-400">Réponse envoyée ✓</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Répondre</h2>
      <input type="hidden" name="to" value={to} />
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Objet
        <input
          name="subject"
          defaultValue={subject}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Message
        <textarea
          name="body"
          required
          rows={6}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600 disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
