import type { ReactNode } from "react";
import { requireEnrolledSession } from "@/lib/auth/guards";
import { AdminLayout } from "@/components/admin-layout/admin-layout";

/**
 * Guard for every back-office page in this route group: a fully-authenticated,
 * MFA-enrolled session is required (the guard redirects to login / verify /
 * enrolment otherwise). Wraps the content in the BO shell.
 */
export default async function DashboardGroupLayout({ children }: { children: ReactNode }) {
  const session = await requireEnrolledSession();
  return <AdminLayout adminEmail={session.adminUser.email}>{children}</AdminLayout>;
}
