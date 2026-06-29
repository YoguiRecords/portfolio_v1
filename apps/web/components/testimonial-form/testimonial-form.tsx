"use client";

import { useState, type FormEvent } from "react";
import { TESTIMONIAL_RELATIONSHIPS } from "@portfolio/core";
import styles from "./testimonial-form.module.css";

type Status = "idle" | "sending" | "ok" | "error";

/**
 * Public testimonial submission form (client island). Posts to the API, which
 * stores the entry as PENDING for moderation. Collects first/last name, role,
 * company and hierarchical relationship. Includes a hidden honeypot field.
 */
export function TestimonialForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const payload = {
      authorName: `${firstName} ${lastName}`.trim(),
      authorRole: String(data.get("authorRole") ?? "") || undefined,
      authorCompany: String(data.get("authorCompany") ?? "") || undefined,
      authorRelationship: String(data.get("authorRelationship") ?? "") || undefined,
      authorEmail: String(data.get("authorEmail") ?? "") || undefined,
      content: String(data.get("content") ?? ""),
      website: String(data.get("website") ?? ""), // honeypot
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/testimonials", {
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
        Merci ! Votre témoignage a été soumis et sera affiché après validation.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="firstName">Prénom</label>
          <input id="firstName" name="firstName" required maxLength={40} />
        </div>
        <div className={styles.field}>
          <label htmlFor="lastName">Nom</label>
          <input id="lastName" name="lastName" required maxLength={40} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="authorRole">Rôle / fonction (optionnel)</label>
          <input id="authorRole" name="authorRole" maxLength={80} placeholder="CTO, Lead Dev…" />
        </div>
        <div className={styles.field}>
          <label htmlFor="authorCompany">Entreprise (optionnel)</label>
          <input id="authorCompany" name="authorCompany" maxLength={120} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="authorRelationship">Votre lien avec Yohan (optionnel)</label>
        <select id="authorRelationship" name="authorRelationship" defaultValue="">
          <option value="">— Sélectionner —</option>
          {Object.entries(TESTIMONIAL_RELATIONSHIPS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="authorEmail">Email (optionnel, non publié)</label>
        <input id="authorEmail" name="authorEmail" type="email" maxLength={120} />
      </div>

      <div className={styles.field}>
        <label htmlFor="content">Votre témoignage</label>
        <textarea id="content" name="content" required minLength={10} maxLength={1000} />
      </div>

      {/* Honeypot — laissé vide par les humains, rempli par les bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
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
