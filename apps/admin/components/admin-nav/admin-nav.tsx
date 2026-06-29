"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** A back-office navigation entry. */
export interface AdminNavItem {
  href: string;
  label: string;
}

/** Back-office sections (pages land progressively in P9–P14). */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/", label: "Tableau de bord" },
  { href: "/profile", label: "Profil" },
  { href: "/content", label: "Contenu home" },
  { href: "/projects", label: "Projets" },
  { href: "/articles", label: "Articles" },
  { href: "/agenda", label: "Agenda" },
  { href: "/testimonials", label: "Témoignages" },
  { href: "/inbox", label: "Inbox" },
  { href: "/ai", label: "Assistant IA" },
];

/** Sidebar navigation with the active item highlighted. */
export function AdminNav({ items = ADMIN_NAV }: { items?: AdminNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
