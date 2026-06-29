"use client";

import { useState, type FormEvent } from "react";
import styles from "./forms.module.css";

type Status = "idle" | "sending" | "ok" | "error";

/**
 * Public contact form (client island). Posts to `/api/contact` (insert-only,
 * stored in the BO inbox). Includes a hidden honeypot; shows a success message.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? "") || undefined,
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
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
    return <p className={`${styles.status} ${styles.ok}`}>Merci ! Votre message a bien été envoyé.</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="c-name">Votre nom</label>
          <input id="c-name" name="name" required maxLength={80} />
        </div>
        <div className={styles.field}>
          <label htmlFor="c-email">Votre email</label>
          <input id="c-email" name="email" type="email" required maxLength={120} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="c-subject">Sujet (optionnel)</label>
        <input id="c-subject" name="subject" maxLength={150} />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-message">Votre message</label>
        <textarea id="c-message" name="message" required minLength={10} maxLength={2000} />
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="c-website">Ne pas remplir</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi…" : "Envoyer →"}
      </button>
      {status === "error" ? (
        <p className={`${styles.status} ${styles.err}`}>
          Une erreur est survenue. Réessayez dans un instant.
        </p>
      ) : null}
    </form>
  );
}
