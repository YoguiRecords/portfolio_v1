"use server";

import { redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { createSession } from "./session";

/**
 * DEV-ONLY quick login: opens a fully-authenticated session for the first admin,
 * bypassing the password + MFA steps. Hard no-op in production (the button is
 * also hidden there) — this must never ship as a real auth path.
 */
export async function quickLoginAction(): Promise<void> {
  if (process.env.NODE_ENV === "production") redirect("/login");

  const admin = await prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) redirect("/login");

  // Dev convenience: mark MFA enrolled so the dashboard guard is satisfied.
  if (!admin.isTotpEnabled) {
    await prisma.adminUser.update({ where: { id: admin.id }, data: { isTotpEnabled: true } });
  }

  await createSession(admin.id, { mfaPending: false });
  redirect("/");
}
