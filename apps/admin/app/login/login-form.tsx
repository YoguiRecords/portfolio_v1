"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { quickLoginAction } from "@/lib/auth/dev-login";

const initialState: LoginState = {};

/** Dev-only: the quick-login shortcut is never rendered in production. */
const QUICK_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

/** Back office login form (client). */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="text-xl font-semibold text-zinc-50">Back office</h1>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-zinc-400">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-500"
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
          {pending ? "Connexion…" : "Se connecter"}
        </button>

        {QUICK_LOGIN_ENABLED ? (
          <button
            type="submit"
            formAction={quickLoginAction}
            className="w-full rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            ⚡ Quick login (dev)
          </button>
        ) : null}
      </form>
    </main>
  );
}
