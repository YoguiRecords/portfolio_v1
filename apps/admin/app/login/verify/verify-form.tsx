"use client";

import { useActionState } from "react";
import { verifyTotpAction, type TotpState } from "@/lib/auth/actions";

const initialState: TotpState = {};

/** Login second-factor (TOTP) form. */
export function VerifyForm() {
  const [state, formAction, pending] = useActionState(verifyTotpAction, initialState);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-50">Vérification</h1>
          <p className="text-sm text-zinc-400">
            Saisissez le code à 6 chiffres de votre application d&apos;authentification.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm text-zinc-400">
            Code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
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
          {pending ? "Vérification…" : "Valider"}
        </button>
      </form>
    </main>
  );
}
