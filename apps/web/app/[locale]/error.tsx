"use client";

import { ErrorScreen } from "../../components/error-screen/error-screen";

/**
 * Locale-level runtime error boundary. Shows a branded generic screen (never
 * technical details) with a retry.
 */
export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorScreen
      code="500"
      title="Un imprévu est survenu."
      message="Réessayez dans un instant — si ça persiste, le formulaire de contact est là pour ça."
      action={
        <button type="button" className="btn btn-ghost on-dark" onClick={reset}>
          Réessayer
        </button>
      }
    />
  );
}
