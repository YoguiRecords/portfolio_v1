"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Pagination,
  Segmented,
  Select,
  Status,
  Toolbar,
  type Column,
  type StatusVariant,
} from "@/components/ui";

/** Ligne de la liste projets (sous-ensemble du modèle Prisma). */
export interface ProjectRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  featured: boolean;
}

/** Server actions injectées (découple le composant client des imports serveur). */
export interface ProjectListActions {
  create: (form: FormData) => Promise<void>;
  setStatus: (form: FormData) => Promise<void>;
  remove: (form: FormData) => Promise<void>;
}

const TYPE_LABEL: Record<string, string> = {
  GAME: "Jeu",
  SOFTWARE: "Logiciel",
  WEBSITE: "Site web",
  BUSINESS: "Business",
};

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  DRAFT: { variant: "draft", label: "Brouillon" },
  PUBLISHED: { variant: "published", label: "Publié" },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "PUBLISHED", label: "Publiés" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const PAGE_SIZE = 8;

/** Liste Projets v2 : recherche, filtre statut, pagination, actions + suppression confirmée. */
export function ProjectsList({ projects, actions }: { projects: ProjectRow[]; actions: ProjectListActions }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ProjectRow | null>(null);
  const [creating, setCreating] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = projects.filter(
    (p) =>
      (status === "ALL" || p.status === status) &&
      (needle === "" || p.title.toLowerCase().includes(needle) || p.slug.includes(needle)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const columns: Column<ProjectRow>[] = [
    {
      key: "title",
      header: "Titre",
      render: (p) => (
        <div>
          <div className="font-medium text-ink">{p.title}</div>
          <div className="text-xs text-muted">{p.slug}</div>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (p) => TYPE_LABEL[p.type] ?? p.type },
    {
      key: "status",
      header: "Statut",
      render: (p) => {
        const meta = STATUS_META[p.status];
        return meta ? <Status variant={meta.variant}>{meta.label}</Status> : p.status;
      },
    },
    { key: "featured", header: "En avant", render: (p) => (p.featured ? "★" : "—") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <Input
          placeholder="Rechercher…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Segmented
          options={[...STATUS_FILTERS]}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => setCreating(true)}>
            Nouveau projet
          </Button>
        </div>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        emptyLabel="Aucun projet"
        rowActions={(p) => (
          <div className="flex items-center justify-end gap-3">
            <Link href={`/projets/${p.id}`} className="text-sm text-accent hover:underline">
              Éditer
            </Link>
            <form action={actions.setStatus}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="status" value={p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
              <button type="submit" className="text-sm text-ink-2 hover:text-ink">
                {p.status === "PUBLISHED" ? "Dépublier" : "Publier"}
              </button>
            </form>
            <button type="button" onClick={() => setToDelete(p)} className="text-sm text-danger hover:underline">
              Supprimer
            </button>
          </div>
        )}
      />

      <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />

      <Drawer open={toDelete !== null} onClose={() => setToDelete(null)} title="Supprimer le projet">
        <p className="text-sm text-ink-2">
          Confirmer la suppression de « {toDelete?.title} » ? Cette action est irréversible.
        </p>
        <form action={actions.remove} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={toDelete?.id ?? ""} />
          <Button variant="danger" type="submit">
            Supprimer définitivement
          </Button>
          <Button variant="ghost" type="button" onClick={() => setToDelete(null)}>
            Annuler
          </Button>
        </form>
      </Drawer>

      <Drawer open={creating} onClose={() => setCreating(false)} title="Nouveau projet">
        <form action={actions.create} className="flex flex-col gap-3">
          <Input name="title" placeholder="Titre" required />
          <Input name="slug" placeholder="slug-du-projet" required />
          <Input name="summary" placeholder="Résumé" required />
          <Select name="type" defaultValue="SOFTWARE">
            <option value="GAME">Jeu</option>
            <option value="SOFTWARE">Logiciel</option>
            <option value="WEBSITE">Site web</option>
            <option value="BUSINESS">Business</option>
          </Select>
          <Button variant="primary" type="submit">
            Créer
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
