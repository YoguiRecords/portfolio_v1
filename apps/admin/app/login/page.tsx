import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isQuickLoginEnabled } from "@/lib/auth/quick-login-flag";
import { LoginForm } from "./login-form";

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
  return <LoginForm quickLoginEnabled={isQuickLoginEnabled()} />;
}
