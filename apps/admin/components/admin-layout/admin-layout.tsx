import type { ReactNode } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { getNavBadges } from "@/lib/data/nav-badges";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { Icon } from "./icons";
import { MobileBar } from "./mobile-bar";
import { Rail } from "./rail";
import { Topbar } from "./topbar";

/**
 * Coquille du back office (BO v2) : rail à icônes (desktop) + topbar + barre de
 * navigation du bas (mobile), autour du contenu de page. Présentationnel — le
 * guard de session tourne dans le layout `(dashboard)`.
 *
 * @param adminEmail - email de l'admin connecté (avatar / footer).
 * @param children - contenu de la page.
 */
export async function AdminLayout({ adminEmail, children }: { adminEmail: string; children: ReactNode }) {
  const badges = await getNavBadges();
  const logoutSlot = (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Se déconnecter"
        className="flex h-10 w-10 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-2 hover:text-danger"
      >
        <Icon name="logout" className="h-5 w-5" />
      </button>
    </form>
  );
  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <Rail badges={badges} logoutSlot={logoutSlot} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar adminEmail={adminEmail} />
        <main className="flex-1 overflow-x-hidden p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileBar badges={badges} logoutSlot={logoutSlot} />
      <CommandPalette />
    </div>
  );
}
