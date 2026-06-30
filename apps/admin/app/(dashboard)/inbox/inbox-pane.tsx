"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { InboxList } from "@/components/inbox/inbox-list";
import type { InboxItem } from "@/lib/inbox/aggregate";

/**
 * Boîte de réception en master-detail : liste filtrable persistante à gauche,
 * détail (route enfant) à droite. En dessous de `lg`, la liste laisse la place
 * au détail dès qu'un message est ouvert (`/inbox/[source]/[id]`).
 */
export function InboxPane({ items, children }: { items: InboxItem[]; children: ReactNode }) {
  const pathname = usePathname();
  const hasSelection = pathname !== "/inbox" && pathname.startsWith("/inbox/");

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr] lg:items-start">
      <aside className={cn("flex-col gap-4", hasSelection ? "hidden lg:flex" : "flex")}>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Boîte de réception</h1>
          <p className="text-sm text-muted">
            Mails et messages de contact réunis. Les demandes de RDV sont traitées à part.
          </p>
        </div>
        <InboxList items={items} />
      </aside>

      <section className={cn("min-w-0", hasSelection ? "block" : "hidden lg:block")}>{children}</section>
    </div>
  );
}
