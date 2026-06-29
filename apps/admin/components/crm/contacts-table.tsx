"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Segmented,
  Select,
  Status,
  Toolbar,
  type Column,
  type StatusVariant,
} from "@/components/ui";

/** Ligne contact (sous-ensemble, société pré-résolue). */
export interface ContactRow {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  companyName: string | null;
  status: string;
}

export interface ContactTableActions {
  create: (form: FormData) => Promise<void>;
  remove: (form: FormData) => Promise<void>;
}

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  LEAD: { variant: "review", label: "Lead" },
  ACTIVE: { variant: "published", label: "Actif" },
  CUSTOMER: { variant: "published", label: "Client" },
  ARCHIVED: { variant: "draft", label: "Archivé" },
};

const FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "LEAD", label: "Leads" },
  { value: "ACTIVE", label: "Actifs" },
  { value: "CUSTOMER", label: "Clients" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const PAGE_SIZE = 10;

/** Liste Contacts CRM : recherche, filtre statut, suppression confirmée, création. */
export function ContactsTable({ contacts, actions }: { contacts: ContactRow[]; actions: ContactTableActions }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ContactRow | null>(null);
  const [creating, setCreating] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = contacts.filter(
    (c) =>
      (status === "ALL" || c.status === status) &&
      (needle === "" ||
        `${c.firstName} ${c.lastName ?? ""}`.toLowerCase().includes(needle) ||
        (c.email ?? "").toLowerCase().includes(needle)),
  );
  const rows = filtered.slice(0, PAGE_SIZE * page);

  const columns: Column<ContactRow>[] = [
    {
      key: "name",
      header: "Nom",
      render: (c) => (
        <Link href={`/contacts/${c.id}`} className="font-medium text-accent hover:underline">
          {c.firstName} {c.lastName ?? ""}
        </Link>
      ),
    },
    { key: "company", header: "Société", render: (c) => c.companyName ?? "—" },
    { key: "email", header: "Email", render: (c) => c.email ?? "—" },
    {
      key: "status",
      header: "Statut",
      render: (c) => {
        const meta = STATUS_META[c.status];
        return meta ? <Status variant={meta.variant}>{meta.label}</Status> : c.status;
      },
    },
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
        <Segmented options={[...FILTERS]} value={status} onChange={(v) => setStatus(v)} />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => setCreating(true)}>
            Nouveau contact
          </Button>
        </div>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        emptyLabel="Aucun contact"
        rowActions={(c) => (
          <button type="button" onClick={() => setToDelete(c)} className="text-sm text-danger hover:underline">
            Supprimer
          </button>
        )}
      />

      {rows.length < filtered.length ? (
        <Button variant="subtle" size="sm" className="self-center" onClick={() => setPage((p) => p + 1)}>
          Afficher plus
        </Button>
      ) : null}

      <Drawer open={toDelete !== null} onClose={() => setToDelete(null)} title="Supprimer le contact">
        <p className="text-sm text-ink-2">
          Confirmer la suppression de « {toDelete?.firstName} {toDelete?.lastName ?? ""} » ?
        </p>
        <form action={actions.remove} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={toDelete?.id ?? ""} />
          <Button variant="danger" type="submit">
            Supprimer
          </Button>
          <Button variant="ghost" type="button" onClick={() => setToDelete(null)}>
            Annuler
          </Button>
        </form>
      </Drawer>

      <Drawer open={creating} onClose={() => setCreating(false)} title="Nouveau contact">
        <form action={actions.create} className="flex flex-col gap-3">
          <Input name="firstName" placeholder="Prénom" required />
          <Input name="lastName" placeholder="Nom" />
          <Input name="email" type="email" placeholder="Email" />
          <Input name="phone" placeholder="Téléphone" />
          <Input name="role" placeholder="Rôle / fonction" />
          <Select name="status" defaultValue="LEAD">
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Actif</option>
            <option value="CUSTOMER">Client</option>
            <option value="ARCHIVED">Archivé</option>
          </Select>
          <Button variant="primary" type="submit">
            Créer
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
