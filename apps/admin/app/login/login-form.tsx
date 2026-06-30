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
    <main className="flex flex-1 items-center justify-center bg-bg px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-surface p-8"
      >
        <h1 className="text-xl font-semibold text-ink">Back office</h1>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-muted">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink outline-none focus:border-accent"
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
          {pending ? "Connexion…" : "Se connecter"}
        </button>

        {QUICK_LOGIN_ENABLED ? (
          <button
            type="submit"
            formAction={quickLoginAction}
            formNoValidate
            className="w-full rounded-md border border-accent/50 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            ⚡ Quick login (dev)
          </button>
        ) : null}
      </form>
    </main>
  );
}
