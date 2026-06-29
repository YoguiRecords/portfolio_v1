"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, Drawer } from "@/components/ui";
import { AdminNav, isNavActive, type NavBadges } from "../admin-nav/admin-nav";
import { Icon, type IconName } from "./icons";

const PRIMARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Accueil", icon: "dashboard" },
  { href: "/projets", label: "Projets", icon: "project" },
  { href: "/mails", label: "Mails", icon: "mail" },
  { href: "/temoignages", label: "Avis", icon: "testimonial" },
];

function BarLink({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
        active ? "text-accent" : "text-muted",
      )}
    >
      <Icon name={icon} className="h-5 w-5" />
      {label}
    </Link>
  );
}

/**
 * Barre de navigation du bas, visible uniquement sur mobile (`< md`). Le bouton
 * « Plus » ouvre un tiroir avec la navigation complète.
 *
 * @param badges - compteurs serveur.
 * @param logoutSlot - formulaire de déconnexion (server action).
 */
export function MobileBar({ badges = {}, logoutSlot }: { badges?: NavBadges; logoutSlot?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-surface md:hidden">
        {PRIMARY.map((item) => (
          <BarLink key={item.href} {...item} active={isNavActive(pathname, item.href)} />
        ))}
        <button
          type="button"
          aria-label="Plus"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted"
        >
          <Icon name="more" className="h-5 w-5" />
          Plus
        </button>
      </nav>
      <Drawer open={open} onClose={() => setOpen(false)} title="Navigation">
        <AdminNav badges={badges} />
        {logoutSlot ? <div className="mt-4">{logoutSlot}</div> : null}
      </Drawer>
    </>
  );
}
