"use client";

import { useActionState } from "react";
import { confirmTotpEnrolmentAction, type TotpEnrolState } from "@/lib/auth/totp-actions";

const initialState: TotpEnrolState = {};

interface TotpEnrolFormProps {
  /** Proposed base32 secret, carried back on submit and persisted on success. */
  secret: string;
}

/** Code-confirmation form for TOTP enrolment. */
export function TotpEnrolForm({ secret }: TotpEnrolFormProps) {
  const [state, formAction, pending] = useActionState(confirmTotpEnrolmentAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="secret" value={secret} />

      <div className="space-y-2">
        <label htmlFor="code" className="block text-sm text-zinc-400">
          Code de confirmation
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 tracking-[0.4em] text-zinc-50 outline-none focus:border-zinc-500"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-50 px-3 py-2 font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-60"
      >
        {pending ? "Activation…" : "Activer la double authentification"}
      </button>
    </form>
  );
}
