"use client";

import { useState } from "react";
import { Button, Field, Input, SaveBar, Select, Switch, Textarea } from "@/components/ui";
import { LivePreview } from "@/components/live-preview/live-preview";
import { ProjectPreview } from "./project-preview";

/** Données d'entête éditables d'un projet. */
export interface ProjectEditorData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tagline: string;
  role: string;
  type: string;
  statusLabel: string;
  status: string;
  featured: boolean;
  showOnCv: boolean;
  cvBadge: string;
}

/**
 * Éditeur d'entête de projet avec **aperçu live** (réduit/fermable). Le state du
 * formulaire alimente l'aperçu à la frappe ; la sauvegarde passe par la server action.
 */
export function ProjectEditor({
  project,
  action,
}: {
  project: ProjectEditorData;
  action: (form: FormData) => Promise<void>;
}) {
  const [data, setData] = useState<ProjectEditorData>(project);
  const [previewOpen, setPreviewOpen] = useState(true);

  function set<K extends keyof ProjectEditorData>(key: K, value: ProjectEditorData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={data.id} />
      <input type="hidden" name="featured" value={data.featured ? "on" : ""} />
      <input type="hidden" name="showOnCv" value={data.showOnCv ? "on" : ""} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Field label="Titre" htmlFor="title">
            <Input id="title" name="title" value={data.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Slug" htmlFor="slug">
            <Input id="slug" name="slug" value={data.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Accroche" htmlFor="tagline">
            <Input id="tagline" name="tagline" value={data.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Résumé" htmlFor="summary">
            <Textarea id="summary" name="summary" value={data.summary} onChange={(e) => set("summary", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rôle" htmlFor="role">
              <Input id="role" name="role" value={data.role} onChange={(e) => set("role", e.target.value)} />
            </Field>
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" value={data.type} onChange={(e) => set("type", e.target.value)}>
                <option value="GAME">Jeu</option>
                <option value="SOFTWARE">Logiciel</option>
                <option value="WEBSITE">Site web</option>
                <option value="BUSINESS">Business</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Field label="Statut" htmlFor="status">
              <Select id="status" name="status" value={data.status} onChange={(e) => set("status", e.target.value)}>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <Switch checked={data.featured} onCheckedChange={(v) => set("featured", v)} label="Mettre en avant" />
              Mettre en avant
            </label>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Field label="Badge CV" htmlFor="cvBadge">
              <Select id="cvBadge" name="cvBadge" value={data.cvBadge} onChange={(e) => set("cvBadge", e.target.value)}>
                <option value="NONE">Aucun</option>
                <option value="KEY">Projet clé</option>
                <option value="IN_PROGRESS">En cours</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <Switch checked={data.showOnCv} onCheckedChange={(v) => set("showOnCv", v)} label="Afficher sur le CV" />
              Afficher sur le CV
            </label>
          </div>
        </div>

        <LivePreview open={previewOpen} onToggle={() => setPreviewOpen((o) => !o)}>
          <ProjectPreview data={data} />
        </LivePreview>
      </div>

      <SaveBar status="Modifications non enregistrées">
        <Button variant="primary" type="submit">
          Enregistrer
        </Button>
      </SaveBar>
    </form>
  );
}
