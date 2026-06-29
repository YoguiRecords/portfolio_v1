"use client";

import { useActionState, useState } from "react";
import { Button, Field, SaveBar, Textarea } from "@/components/ui";
import { updateCvHtmlAction, type CvFormState } from "@/lib/actions/content-actions";

const initialState: CvFormState = {};

/**
 * Éditeur du CV HTML (premium). Aperçu rendu de façon **isolée** dans un
 * `<iframe sandbox srcDoc>` — le HTML n'est jamais injecté dans le DOM admin
 * (cf. STACK_SECURITY §5). `sandbox=""` bloque scripts/formulaires/navigation.
 */
export function CvEditor({ initialHtml }: { initialHtml: string }) {
  const [state, formAction, pending] = useActionState(updateCvHtmlAction, initialState);
  const [html, setHtml] = useState(initialHtml);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <Field label="CV (HTML)" htmlFor="cvHtml">
          <Textarea
            id="cvHtml"
            name="cvHtml"
            className="min-h-[28rem] font-mono text-xs"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Aperçu isolé (sandbox)</span>
          <iframe
            title="Aperçu du CV"
            sandbox=""
            srcDoc={html}
            className="h-[28rem] w-full rounded-card border border-border bg-white"
          />
        </div>
      </div>

      {state.ok ? (
        <p role="status" className="text-sm text-ok">
          CV enregistré.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <SaveBar status="Le CV est rendu en bac à sable (sandbox), isolé du back office.">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </SaveBar>
    </form>
  );
}
