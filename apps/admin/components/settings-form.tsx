"use client";

import { useActionState } from "react";
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
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Site settings editor (client island → saveSettingsAction). */
export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {} as { ok?: boolean; error?: string });
  const v = (k: keyof Settings) => (settings?.[k] as string | null) ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nom de marque
          <input className={input} name="brandName" defaultValue={v("brandName")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nom du site
          <input className={input} name="siteName" defaultValue={v("siteName")} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Titre SEO par défaut
        <input className={input} name="defaultSeoTitle" defaultValue={v("defaultSeoTitle")} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Description SEO par défaut
        <textarea className={input} name="defaultSeoDescription" rows={2} defaultValue={v("defaultSeoDescription")} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Titre footer
          <input className={input} name="footerHeadline" defaultValue={v("footerHeadline")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Signature footer
          <input className={input} name="footerSignature" defaultValue={v("footerSignature")} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Email de contact
          <input className={input} name="contactEmail" type="email" defaultValue={v("contactEmail")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Bandeau de disponibilité
          <input className={input} name="availabilityBanner" defaultValue={v("availabilityBanner")} />
        </label>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="isContactFormEnabled" defaultChecked={settings?.isContactFormEnabled ?? true} />
          Formulaire de contact actif
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="allowAiCrawlers" defaultChecked={settings?.allowAiCrawlers ?? true} />
          Autoriser les crawlers IA
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        llms.txt
        <textarea className={input} name="llmsTxt" rows={3} defaultValue={v("llmsTxt")} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        robots.txt (lignes supplémentaires)
        <textarea className={input} name="robotsExtra" rows={2} defaultValue={v("robotsExtra")} />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {state.ok ? <span className="text-sm text-emerald-400">Enregistré ✓</span> : null}
        {state.error ? <span className="text-sm text-red-400">{state.error}</span> : null}
      </div>
    </form>
  );
}
