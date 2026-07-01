"use client";

import { useState } from "react";
import styles from "./forms.module.css";

type Status = "idle" | "sending" | "done";

/**
 * Self-service cancellation widget. Posts the token to `/api/booking/cancel` and
 * always shows a generic outcome (no enumeration of whether it matched).
 */
export function CancelBooking({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");

  if (!token) {
    return <p className={`${styles.status} ${styles.err}`}>Lien d’annulation invalide.</p>;
  }

  if (status === "done") {
    return (
      <p className={`${styles.status} ${styles.ok}`}>
        Si un rendez-vous correspondait à ce lien, il a bien été annulé. Merci de nous avoir prévenus.
      </p>
    );
  }

  async function onCancel() {
    setStatus("sending");
    try {
      await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Generic outcome regardless — never leak state.
    } finally {
      setStatus("done");
    }
  }

  return (
    <button className="btn btn-primary" type="button" onClick={onCancel} disabled={status === "sending"}>
      {status === "sending" ? "Annulation…" : "Annuler mon rendez-vous"}
    </button>
  );
}
