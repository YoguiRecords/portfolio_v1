"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { Icon, type IconName } from "../admin-layout/icons";

/** Clés de compteur affichables en pastille de navigation. */
export type NavBadgeKey = "pendingTestimonials" | "unreadMessages" | "pendingAppointments";

/** Compteurs de navigation (non-lus, à-valider…). */
export type NavBadges = Partial<Record<NavBadgeKey, number>>;

/** Groupes de navigation du BO v2. */
export type NavGroup = "Contenu" | "Relation client" | "Mesure";

/** Une entrée de navigation du back office. */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Absent = entrée d'en-tête (hors groupe). */
  group?: NavGroup;
  /** Compteur optionnel affiché en pastille. */
  badgeKey?: NavBadgeKey;
}

/** Ordre d'affichage des groupes. */
export const NAV_GROUPS: NavGroup[] = ["Contenu", "Relation client", "Mesure"];

/** Sections du back office (les pages CRM/Inbox arrivent en P9–P12). */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/", label: "Tableau de bord", icon: "dashboard" },
  { href: "/profile", label: "Profil", icon: "user", group: "Contenu" },
  { href: "/cv", label: "CV", icon: "article", group: "Contenu" },
  { href: "/content", label: "Contenu home", icon: "home", group: "Contenu" },
  { href: "/competences", label: "Compétences", icon: "skills", group: "Contenu" },
  { href: "/parcours", label: "Parcours", icon: "path", group: "Contenu" },
  { href: "/projets", label: "Projets", icon: "project", group: "Contenu" },
  { href: "/articles", label: "Articles", icon: "article", group: "Contenu" },
  { href: "/media", label: "Médias", icon: "media", group: "Contenu" },
  { href: "/faq", label: "FAQ", icon: "faq", group: "Contenu" },
  { href: "/inbox", label: "Boîte de réception", icon: "mail", group: "Relation client", badgeKey: "unreadMessages" },
  { href: "/contacts", label: "Contacts", icon: "user", group: "Relation client" },
  { href: "/societes", label: "Sociétés", icon: "project", group: "Relation client" },
  { href: "/pipeline", label: "Pipeline", icon: "chart", group: "Relation client" },
  { href: "/temoignages", label: "Témoignages", icon: "testimonial", group: "Relation client", badgeKey: "pendingTestimonials" },
  { href: "/rdv", label: "Rendez-vous", icon: "rdv", group: "Relation client", badgeKey: "pendingAppointments" },
  { href: "/agenda", label: "Agenda", icon: "agenda", group: "Relation client" },
  { href: "/calendrier", label: "Calendrier", icon: "calendar", group: "Relation client" },
  { href: "/analyses", label: "Analyses", icon: "chart", group: "Mesure" },
  { href: "/ai", label: "Assistant IA", icon: "ai", group: "Mesure" },
  { href: "/reglages", label: "Réglages", icon: "settings", group: "Mesure" },
];

/** Vrai si `href` correspond à la route active (`/` exact, sinon préfixe de segment). */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active, badge }: { item: AdminNavItem; active: boolean; badge?: number }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-control px-3 py-2 text-sm transition-colors",
        active ? "bg-accent/15 font-semibold text-accent" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-bg">{badge}</span>
      ) : null}
    </Link>
  );
}

/**
 * Navigation groupée et libellée (icône + label + compteur). Utilisée dans le
 * tiroir mobile ; le rail desktop (icônes seules) vit dans `admin-layout/rail`.
 */
export function AdminNav({ items = ADMIN_NAV, badges = {} }: { items?: AdminNavItem[]; badges?: NavBadges }) {
  const pathname = usePathname();
  const header = items.filter((item) => !item.group);
  return (
    <nav className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {header.map((item) => (
          <NavLink key={item.href} item={item} active={isNavActive(pathname, item.href)} />
        ))}
      </div>
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <span className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">{group}</span>
            {groupItems.map((item) => (
              <NavLink
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
  );
}
