"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { saveSettingsAction } from "@/lib/actions/content-actions";

interface Settings {
  brandName: string | null;
  siteName: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  footerHeadline: string | null;
  footerSignature: string | null;
  contactEmail: string | null;
  availabilityBanner: string | null;
  isContactFormEnabled: boolean;
  allowAiCrawlers: boolean;
  llmsTxt: string | null;
  robotsExtra: string | null;
}

const input =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Site settings editor (client island → saveSettingsAction). */
export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {} as { ok?: boolean; error?: string });
  const v = (k: keyof Settings) => (settings?.[k] as string | null) ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Nom de marque
          <input className={input} name="brandName" defaultValue={v("brandName")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Nom du site
          <input className={input} name="siteName" defaultValue={v("siteName")} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Titre SEO par défaut
        <input className={input} name="defaultSeoTitle" defaultValue={v("defaultSeoTitle")} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Description SEO par défaut
        <textarea className={input} name="defaultSeoDescription" rows={2} defaultValue={v("defaultSeoDescription")} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Titre footer
          <input className={input} name="footerHeadline" defaultValue={v("footerHeadline")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Signature footer
          <input className={input} name="footerSignature" defaultValue={v("footerSignature")} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Email de contact
          <input className={input} name="contactEmail" type="email" defaultValue={v("contactEmail")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Bandeau de disponibilité
          <input className={input} name="availabilityBanner" defaultValue={v("availabilityBanner")} />
        </label>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="isContactFormEnabled" defaultChecked={settings?.isContactFormEnabled ?? true} />
          Formulaire de contact actif
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="allowAiCrawlers" defaultChecked={settings?.allowAiCrawlers ?? true} />
          Autoriser les crawlers IA
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        llms.txt
        <textarea className={input} name="llmsTxt" rows={3} defaultValue={v("llmsTxt")} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        robots.txt (lignes supplémentaires)
        <textarea className={input} name="robotsExtra" rows={2} defaultValue={v("robotsExtra")} />
      </label>

      <div className="flex items-center gap-3">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.ok ? <span className="text-sm text-ok">Enregistré ✓</span> : null}
        {state.error ? <span className="text-sm text-danger">{state.error}</span> : null}
      </div>
    </form>
  );
}
