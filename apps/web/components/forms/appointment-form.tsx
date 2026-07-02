"use client";

import { useState, type FormEvent } from "react";
import styles from "./forms.module.css";
import { SlotSelect } from "./slot-select";

type Status = "idle" | "sending" | "ok" | "error";

/**
 * Public appointment-request form (client island). Posts to `/api/appointments`
 * (stored PENDING, confirmed in the BO). Hidden honeypot; success message.
 */
export function AppointmentForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const requested = String(data.get("requestedAt") ?? "");
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      topic: String(data.get("topic") ?? "") || undefined,
      message: String(data.get("message") ?? "") || undefined,
      requestedAt: requested || undefined,
      website: String(data.get("website") ?? ""),
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className={`${styles.status} ${styles.ok}`}>
        Merci ! Votre demande de rendez-vous a été transmise.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="a-name">Votre nom</label>
          <input id="a-name" name="name" required maxLength={80} />
        </div>
        <div className={styles.field}>
          <label htmlFor="a-email">Votre email</label>
          <input id="a-email" name="email" type="email" required maxLength={120} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="a-topic">Sujet (optionnel)</label>
          <input id="a-topic" name="topic" maxLength={150} />
        </div>
        <div className={styles.field}>
          <label htmlFor="a-when">Créneau souhaité (optionnel — 30 min, sous réserve de confirmation)</label>
          <SlotSelect id="a-when" name="requestedAt" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="a-message">Message (optionnel)</label>
        <textarea id="a-message" name="message" maxLength={2000} />
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="a-website">Ne pas remplir</label>
        <input id="a-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi…" : "Demander un rendez-vous →"}
      </button>
      {status === "error" ? (
        <p className={`${styles.status} ${styles.err}`}>
          Une erreur est survenue. Réessayez dans un instant.
        </p>
      ) : null}
    </form>
  );
}
