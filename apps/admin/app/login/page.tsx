import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { quickLoginAction } from "@/lib/auth/dev-login";
import { LoginForm } from "./login-form";

/** Dev-only: the quick-login button is never rendered in production. */
const QUICK_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

/**
 * Login route. Validates any existing session server-side: a valid session
 * skips straight to the dashboard, while an expired/forged cookie simply falls
 * through to the form (no redirect loop with the protected pages).
 */
export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/");
  }
  return (
    <>
      <LoginForm />
      {QUICK_LOGIN_ENABLED ? (
        <form action={quickLoginAction} className="mt-4 flex justify-center">
          <button
            type="submit"
            className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            ⚡ Quick login (dev)
          </button>
        </form>
      ) : null}
    </>
  );
}
