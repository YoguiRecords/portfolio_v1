import Link from "next/link";
import { Panel } from "@/components/ui";
import type { ContentToTreat } from "@/lib/data/dashboard";

/** Liste « à traiter » : brouillons, programmés, témoignages — liens directs. */
export function ContentToTreatPanel({ data }: { data: ContentToTreat }) {
  const rows = [
    { label: "Projets en brouillon", value: data.draftProjects, href: "/projets" },
    { label: "Articles en brouillon", value: data.draftArticles, href: "/articles" },
    { label: "Articles programmés", value: data.scheduledArticles, href: "/articles" },
    { label: "Témoignages à valider", value: data.pendingTestimonials, href: "/temoignages" },
  ];
  return (
    <Panel title="À traiter">
      <ul className="flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <li key={row.label}>
            <Link
              href={row.href}
              className="flex items-center justify-between py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <span>{row.label}</span>
              <span className={row.value > 0 ? "font-bold text-accent" : "text-muted"}>{row.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
