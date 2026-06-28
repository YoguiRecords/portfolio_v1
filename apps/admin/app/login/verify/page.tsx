import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { VerifyForm } from "./verify-form";

/**
 * Login MFA step. Only reachable with a pending session: a missing session goes
 * back to login, an already-verified one skips to the dashboard.
 */
export default async function VerifyPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.mfaPending) {
    redirect("/");
  }
  return <VerifyForm />;
}
