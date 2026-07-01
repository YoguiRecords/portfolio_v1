"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "./chat-widget.module.css";

type Status = "idle" | "sending" | "done" | "taken" | "error";

/** Formats an ISO slot start for display (French, Europe/Paris). */
function slotLabel(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * In-chat booking card. Loads the real free slots, collects the visitor's
 * identity (first/last name, email, phone) + reason + chosen slot, and submits
 * to `/api/booking`. Validated server-side (Zod) — no LLM field extraction.
 */
export function BookingForm({ onClose }: { onClose: () => void }) {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function loadSlots() {
    setSlots(null);
    try {
      const res = await fetch("/api/availability");
      const data = (await res.json()) as { slots?: string[] };
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    }
  }

  useEffect(() => {
    void loadSlots();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      reason: String(fd.get("reason") ?? "").trim(),
      requestedAt: String(fd.get("requestedAt") ?? ""),
    };
    if (!payload.requestedAt) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) setStatus("done");
      else if (res.status === 409) {
        setStatus("taken");
        void loadSlots();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={styles.booking}>
        <p className={`${styles.msg} ${styles.assistant}`}>
          Merci ! Votre demande de rendez-vous est enregistrée. Yohan la validera dès que possible
          et vous recevrez un email de confirmation. À très vite&nbsp;!
        </p>
        <button type="button" className={styles.bookingSecondary} onClick={onClose}>
          Retour au chat
        </button>
      </div>
    );
  }

  return (
    <form className={styles.booking} onSubmit={onSubmit}>
      <div className={styles.bookingHead}>
        <strong>Réserver un échange</strong>
        <button type="button" className={styles.bookingClose} onClick={onClose} aria-label="Fermer le formulaire">
          ✕
        </button>
      </div>

      <div className={styles.bookingRow}>
        <input name="firstName" placeholder="Prénom" required maxLength={60} aria-label="Prénom" />
        <input name="lastName" placeholder="Nom" required maxLength={60} aria-label="Nom" />
      </div>
      <input name="email" type="email" placeholder="Email" required maxLength={120} aria-label="Email" />
      <input name="phone" type="tel" placeholder="Téléphone" required maxLength={30} aria-label="Téléphone" />
      <input name="reason" placeholder="Motif du rendez-vous" required maxLength={300} aria-label="Motif" />

      <select name="requestedAt" required aria-label="Créneau" defaultValue="">
        <option value="" disabled>
          {slots === null ? "Chargement des créneaux…" : slots.length ? "Choisir un créneau" : "Aucun créneau disponible"}
        </option>
        {(slots ?? []).map((iso) => (
          <option key={iso} value={iso}>
            {slotLabel(iso)}
          </option>
        ))}
      </select>

      {status === "taken" ? (
        <p className={styles.bookingError}>Ce créneau vient d’être pris. Choisissez-en un autre.</p>
      ) : null}
      {status === "error" ? (
        <p className={styles.bookingError}>Une erreur est survenue. Réessayez dans un instant.</p>
      ) : null}

      <button type="submit" className={styles.bookingSubmit} disabled={status === "sending" || !slots?.length}>
        {status === "sending" ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
