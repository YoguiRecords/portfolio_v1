"use client";

import { useState } from "react";
import { Button, Field, Input, SaveBar, Select, Textarea } from "@/components/ui";
import { LivePreview } from "@/components/live-preview/live-preview";
import { ArticlePreview } from "./article-preview";

/** Données éditables d'un article. */
export interface ArticleEditorData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  /** Tags joints par des virgules (édition). */
  tags: string;
  status: string;
  /** Format datetime-local (`YYYY-MM-DDTHH:mm`) ou "". */
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
}

/** Éditeur d'article (markdown + aperçu live + publication programmée). */
export function ArticleEditor({
  article,
  action,
}: {
  article: ArticleEditorData;
  action: (form: FormData) => Promise<void>;
}) {
  const [data, setData] = useState<ArticleEditorData>(article);
  const [previewOpen, setPreviewOpen] = useState(true);

  function set<K extends keyof ArticleEditorData>(key: K, value: ArticleEditorData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const tagList = data.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={data.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Field label="Titre" htmlFor="title">
            <Input id="title" name="title" value={data.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Slug" htmlFor="slug">
            <Input id="slug" name="slug" value={data.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Accroche" htmlFor="excerpt">
            <Input id="excerpt" name="excerpt" value={data.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </Field>
          <Field label="Contenu (markdown)" htmlFor="content">
            <Textarea
              id="content"
              name="content"
              className="min-h-64 font-mono"
              value={data.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </Field>
          <Field label="Tags (séparés par des virgules)" htmlFor="tags">
            <Input id="tags" name="tags" value={data.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Statut" htmlFor="status">
              <Select id="status" name="status" value={data.status} onChange={(e) => set("status", e.target.value)}>
                <option value="DRAFT">Brouillon</option>
                <option value="SCHEDULED">Programmée</option>
                <option value="PUBLISHED">Publiée</option>
              </Select>
            </Field>
            <Field
              label="Date de programmation"
              htmlFor="scheduledAt"
              hint={data.status === "SCHEDULED" ? "Requise pour une actu programmée" : undefined}
            >
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={data.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Titre SEO" htmlFor="seoTitle">
            <Input id="seoTitle" name="seoTitle" value={data.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          </Field>
          <Field label="Description SEO" htmlFor="seoDescription">
            <Textarea
              id="seoDescription"
              name="seoDescription"
              value={data.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
            />
          </Field>
        </div>

        <LivePreview open={previewOpen} onToggle={() => setPreviewOpen((o) => !o)}>
          <ArticlePreview data={{ title: data.title, excerpt: data.excerpt, content: data.content, tags: tagList }} />
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
