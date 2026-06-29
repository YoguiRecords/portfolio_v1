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

/** Ligne de la liste articles (sous-ensemble du modèle Prisma, dates pré-formatées). */
export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  scheduledAtLabel: string | null;
  tagCount: number;
}

/** Server actions injectées (découple le composant client des imports serveur). */
export interface ArticleListActions {
  create: (form: FormData) => Promise<void>;
  remove: (form: FormData) => Promise<void>;
}

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  DRAFT: { variant: "draft", label: "Brouillon" },
  SCHEDULED: { variant: "review", label: "Programmée" },
  PUBLISHED: { variant: "published", label: "Publiée" },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "SCHEDULED", label: "Programmés" },
  { value: "DRAFT", label: "Brouillons" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const PAGE_SIZE = 8;

/** Liste Articles v2 : recherche, filtre statut, pagination, suppression confirmée. */
export function ArticlesList({ articles, actions }: { articles: ArticleRow[]; actions: ArticleListActions }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ArticleRow | null>(null);
  const [creating, setCreating] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = articles.filter(
    (a) =>
      (status === "ALL" || a.status === status) &&
      (needle === "" || a.title.toLowerCase().includes(needle) || a.slug.includes(needle)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const columns: Column<ArticleRow>[] = [
    {
      key: "title",
      header: "Titre",
      render: (a) => (
        <div>
          <div className="font-medium text-ink">{a.title}</div>
          <div className="text-xs text-muted">{a.slug}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (a) => {
        const meta = STATUS_META[a.status];
        return meta ? <Status variant={meta.variant}>{meta.label}</Status> : a.status;
      },
    },
    { key: "scheduledAt", header: "Programmée", render: (a) => a.scheduledAtLabel ?? "—" },
    { key: "tags", header: "Tags", align: "right", render: (a) => a.tagCount },
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
            Nouvelle actu
          </Button>
        </div>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        emptyLabel="Aucun article"
        rowActions={(a) => (
          <div className="flex items-center justify-end gap-3">
            <Link href={`/articles/${a.id}`} className="text-sm text-accent hover:underline">
              Éditer
            </Link>
            <button type="button" onClick={() => setToDelete(a)} className="text-sm text-danger hover:underline">
              Supprimer
            </button>
          </div>
        )}
      />

      <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />

      <Drawer open={toDelete !== null} onClose={() => setToDelete(null)} title="Supprimer l’article">
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

      <Drawer open={creating} onClose={() => setCreating(false)} title="Nouvelle actu">
        <form action={actions.create} className="flex flex-col gap-3">
          <Input name="title" placeholder="Titre" required />
          <Input name="slug" placeholder="slug-de-l-actu" required />
          <Input name="excerpt" placeholder="Accroche" required />
          <Input name="tags" placeholder="tags séparés par des virgules" />
          <div className="grid grid-cols-2 gap-2">
            <Select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Brouillon</option>
              <option value="SCHEDULED">Programmée</option>
              <option value="PUBLISHED">Publiée</option>
            </Select>
            <Input name="scheduledAt" type="datetime-local" />
          </div>
          <Button variant="primary" type="submit">
            Créer
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
