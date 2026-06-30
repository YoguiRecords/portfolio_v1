"use client";

import { useActionState, useState } from "react";
import { Button, Field, Input, SaveBar, Switch, Textarea } from "@/components/ui";
import { LivePreview } from "@/components/live-preview/live-preview";
import { AboutPreview } from "@/components/profile/about-preview";
import { upsertProfileAction, type ProfileFormState } from "@/lib/actions/content-actions";

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
  cvAccroche: string;
  cvAvailabilityStart: string;
  cvMobility: string;
  cvContractType: string;
};

/**
 * Profile editor (client) with a live "À propos" preview. `useActionState` drives
 * the save feedback; controlled fields feed the preview as the user types.
 */
export function ProfileForm({ profile }: { profile: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(upsertProfileAction, initialState);
  const [data, setData] = useState<ProfileFormValues>(profile);
  const [previewOpen, setPreviewOpen] = useState(true);

  function set<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="isAvailable" value={data.isAvailable ? "on" : ""} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Field label="Nom complet" htmlFor="fullName">
            <Input id="fullName" name="fullName" value={data.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </Field>
          <Field label="Accroche (headline)" htmlFor="headline">
            <Input id="headline" name="headline" value={data.headline} onChange={(e) => set("headline", e.target.value)} required />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Bio" htmlFor="bio">
            <Textarea id="bio" name="bio" value={data.bio} onChange={(e) => set("bio", e.target.value)} required />
          </Field>
          <Field label="Phrases du typewriter (une par ligne)" htmlFor="typewriterLines">
            <Textarea
              id="typewriterLines"
              name="typewriterLines"
              value={data.typewriterLines.join("\n")}
              onChange={(e) => set("typewriterLines", e.target.value.split("\n"))}
            />
          </Field>
          <Field label="Signature" htmlFor="sigText">
            <Input id="sigText" name="sigText" value={data.sigText} onChange={(e) => set("sigText", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Localisation" htmlFor="location">
              <Input id="location" name="location" value={data.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Rôle actuel" htmlFor="currentRole">
              <Input id="currentRole" name="currentRole" value={data.currentRole} onChange={(e) => set("currentRole", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Field label="Libellé de disponibilité" htmlFor="availabilityLabel">
              <Input
                id="availabilityLabel"
                name="availabilityLabel"
                value={data.availabilityLabel}
                onChange={(e) => set("availabilityLabel", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <Switch checked={data.isAvailable} onCheckedChange={(v) => set("isAvailable", v)} label="Disponible" />
              Disponible
            </label>
          </div>
          <Field label="Résumé IA (chatbot / SEO)" htmlFor="aiSummary">
            <Textarea id="aiSummary" name="aiSummary" value={data.aiSummary} onChange={(e) => set("aiSummary", e.target.value)} />
          </Field>

          <div className="mt-2 border-t border-border pt-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">CV</h2>
            <Field label="Accroche du CV" htmlFor="cvAccroche">
              <Textarea
                id="cvAccroche"
                name="cvAccroche"
                value={data.cvAccroche}
                onChange={(e) => set("cvAccroche", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prise de poste" htmlFor="cvAvailabilityStart">
                <Input
                  id="cvAvailabilityStart"
                  name="cvAvailabilityStart"
                  value={data.cvAvailabilityStart}
                  onChange={(e) => set("cvAvailabilityStart", e.target.value)}
                />
              </Field>
              <Field label="Contrat" htmlFor="cvContractType">
                <Input
                  id="cvContractType"
                  name="cvContractType"
                  value={data.cvContractType}
                  onChange={(e) => set("cvContractType", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Mobilité" htmlFor="cvMobility">
              <Input
                id="cvMobility"
                name="cvMobility"
                value={data.cvMobility}
                onChange={(e) => set("cvMobility", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <LivePreview open={previewOpen} onToggle={() => setPreviewOpen((o) => !o)}>
          <AboutPreview
            data={{
              fullName: data.fullName,
              headline: data.headline,
              currentRole: data.currentRole,
              location: data.location,
              bio: data.bio,
              availabilityLabel: data.availabilityLabel,
              isAvailable: data.isAvailable,
            }}
          />
        </LivePreview>
      </div>

      {state.ok ? (
        <p role="status" className="text-sm text-ok">
          Profil enregistré.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <SaveBar status="Modifications non enregistrées">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </SaveBar>
    </form>
  );
}
