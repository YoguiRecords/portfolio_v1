"use client";

import { useActionState } from "react";
import {
  upsertProfileAction,
  type ProfileFormState,
} from "@/lib/actions/content-actions";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

const initialState: ProfileFormState = {};

/** Fields the editor exposes (singleton profile, server-fetched). */
export type ProfileFormValues = {
  fullName: string;
  headline: string;
  email: string;
  bio: string;
  typewriterLines: string[];
  sigText: string;
  location: string;
  currentRole: string;
  availabilityLabel: string;
  isAvailable: boolean;
  aiSummary: string;
};

/**
 * Profile editor form (client). Uses `useActionState` so the save action's
 * result drives a visible success/error message and a pending button state.
 */
export function ProfileForm({ profile }: { profile: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(
    upsertProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-50">Profil</h1>

      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Nom complet
        <input className={inputCls} name="fullName" defaultValue={profile.fullName} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Headline
        <input className={inputCls} name="headline" defaultValue={profile.headline} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Email
        <input className={inputCls} name="email" type="email" defaultValue={profile.email} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Bio
        <textarea className={`${inputCls} min-h-28`} name="bio" defaultValue={profile.bio} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Phrases du typewriter (une par ligne)
        <textarea
          className={`${inputCls} min-h-24`}
          name="typewriterLines"
          defaultValue={profile.typewriterLines.join("\n")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Signature
        <input className={inputCls} name="sigText" defaultValue={profile.sigText} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-300">
          Localisation
          <input className={inputCls} name="location" defaultValue={profile.location} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-300">
          Rôle actuel
          <input className={inputCls} name="currentRole" defaultValue={profile.currentRole} />
        </label>
      </div>
      <div className="flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-300">
          Libellé de disponibilité
          <input className={inputCls} name="availabilityLabel" defaultValue={profile.availabilityLabel} />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-300">
          <input type="checkbox" name="isAvailable" defaultChecked={profile.isAvailable} /> Disponible
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Résumé IA (pour le chatbot / SEO)
        <textarea className={`${inputCls} min-h-20`} name="aiSummary" defaultValue={profile.aiSummary} />
      </label>

      {state.ok ? (
        <p role="status" className="text-sm text-emerald-400">
          Profil enregistré.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-600 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
