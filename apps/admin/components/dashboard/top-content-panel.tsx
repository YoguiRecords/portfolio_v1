import { DataTable, Panel, type Column } from "@/components/ui";
import type { TopContentItem } from "@/lib/data/dashboard";

const columns: Column<TopContentItem>[] = [
  { key: "title", header: "Titre", render: (row) => row.title },
  { key: "kind", header: "Type", render: (row) => (row.kind === "project" ? "Projet" : "Article") },
  {
    key: "publishedAt",
    header: "Publié le",
    align: "right",
    render: (row) => (row.publishedAt ? row.publishedAt.toLocaleDateString("fr-FR") : "—"),
  },
];

/** Table des contenus publiés les plus récents (projets + articles fusionnés). */
export function TopContentPanel({ items }: { items: TopContentItem[] }) {
  return (
    <Panel title="Contenus récents">
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => `${row.kind}-${row.id}`}
        emptyLabel="Aucun contenu publié"
      />
    </Panel>
  );
}
