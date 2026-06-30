"use client";

import { useState } from "react";
import { Button } from "./button";

/**
 * Submit button guarded by a two-step confirmation (anti misclick): the first
 * click only arms the confirmation, the second actually submits the surrounding
 * form. Drop-in replacement for a `<button type="submit">` inside a
 * `<form action={deleteXAction}>` — the confirm button submits that form.
 */
export function ConfirmSubmitButton({
  label = "Supprimer",
  confirmLabel = "Supprimer",
  className,
}: {
  /** Trigger content shown before arming (e.g. "Supprimer", "✕"). */
  label?: string;
  /** Label of the destructive confirm button once armed. */
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button variant="subtle" size="sm" type="button" className={className} onClick={() => setArmed(true)}>
        {label}
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <Button variant="danger" size="sm" type="submit">
        {confirmLabel}
      </Button>
      <Button variant="ghost" size="sm" type="button" onClick={() => setArmed(false)}>
        Annuler
      </Button>
    </span>
  );
}
