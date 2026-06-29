import type { ReactNode } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { AdminNav } from "../admin-nav/admin-nav";

/**
 * Back-office shell: a fixed sidebar (brand + nav + logout) and the main content
 * area. Presentational — the route guard runs in the (dashboard) layout.
 *
 * @param adminEmail - the signed-in admin email (shown in the sidebar footer).
 * @param children - the page content.
 */
export function AdminLayout({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-60 flex-col justify-between border-r border-zinc-800 p-4">
        <div className="flex flex-col gap-6">
          <span className="px-3 text-lg font-bold">
            Yohan<span className="text-amber-500">.</span> BO
          </span>
          <AdminNav />
        </div>
        <div className="flex flex-col gap-3 px-3">
          <span className="truncate text-xs text-zinc-500">{adminEmail}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
