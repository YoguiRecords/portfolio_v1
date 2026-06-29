"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { ADMIN_NAV, NAV_GROUPS, isNavActive, type AdminNavItem, type NavBadges } from "../admin-nav/admin-nav";
import { Icon } from "./icons";

function RailLink({ item, active, badge }: { item: AdminNavItem; active: boolean; badge?: number }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-control transition-colors",
        active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon name={item.icon} className="h-5 w-5" />
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-bg">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Rail de navigation desktop (icônes seules + tooltips, groupées). Masqué sous
 * `md` (la barre du bas mobile prend le relais).
 *
 * @param badges - compteurs serveur (non-lus, à-valider).
 * @param logoutSlot - formulaire de déconnexion rendu côté serveur (server action).
 */
export function Rail({ badges = {}, logoutSlot }: { badges?: NavBadges; logoutSlot?: ReactNode }) {
  const pathname = usePathname();
  const header = ADMIN_NAV.filter((item) => !item.group);
  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col items-center gap-4 border-r border-border bg-surface py-4 md:flex">
      <Link href="/" aria-label="Accueil" className="text-lg font-black text-ink">
        Y<span className="text-accent">.</span>
      </Link>
      <nav className="flex flex-1 flex-col items-center gap-1">
        {header.map((item) => (
          <RailLink key={item.href} item={item} active={isNavActive(pathname, item.href)} />
        ))}
        {NAV_GROUPS.map((group) => {
          const groupItems = ADMIN_NAV.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="flex flex-col items-center gap-1">
              <span className="my-1 h-px w-6 bg-border" aria-hidden />
              {groupItems.map((item) => (
                <RailLink
                  key={item.href}
                  item={item}
                  active={isNavActive(pathname, item.href)}
                  badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                />
              ))}
            </div>
          );
        })}
      </nav>
      {logoutSlot}
    </aside>
  );
}
