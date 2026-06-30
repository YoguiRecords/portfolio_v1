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
        <label htmlFor="code" className="block text-sm text-muted">
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
          className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 tracking-[0.4em] text-ink outline-none focus:border-accent"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-3 py-2 font-medium text-bg transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Activation…" : "Activer la double authentification"}
      </button>
    </form>
  );
}
