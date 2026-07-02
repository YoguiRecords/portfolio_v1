"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { groupSlotsByDay } from "../../lib/booking/slots";
import styles from "./chat-widget.module.css";

type Status = "idle" | "sending" | "done" | "taken" | "error";

/**
 * In-chat booking card. Loads the real free slots (grouped by Paris day),
 * collects the visitor's identity (first/last name, email, phone) + reason +
 * chosen slot, and submits to `/api/booking`. Validated server-side (Zod) —
 * no LLM field extraction.
 */
export function BookingForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations("chat.booking");
  const locale = useLocale();
  const [slots, setSlots] = useState<string[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function fetchSlots(): Promise<string[]> {
    try {
      const res = await fetch("/api/availability");
      const data = (await res.json()) as { slots?: string[] };
      return Array.isArray(data.slots) ? data.slots : [];
    } catch {
      return [];
    }
  }

  /** Refreshes slots (event-handler use, e.g. after a slot is taken). */
  async function reloadSlots() {
    setSlots(null);
    setSlots(await fetchSlots());
  }

  useEffect(() => {
    let active = true;
    void fetchSlots().then((s) => {
      if (active) setSlots(s);
    });
    return () => {
      active = false;
    };
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
        void reloadSlots();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={styles.booking}>
        <p className={`${styles.msg} ${styles.assistant}`}>{t("done")}</p>
        <button type="button" className={styles.bookingSecondary} onClick={onClose}>
          {t("back")}
        </button>
      </div>
    );
  }

  const groups = groupSlotsByDay(slots ?? [], locale);

  return (
    <form className={styles.booking} onSubmit={onSubmit}>
      <div className={styles.bookingHead}>
        <strong>{t("title")}</strong>
        <button type="button" className={styles.bookingClose} onClick={onClose} aria-label={t("close")}>
          ✕
        </button>
      </div>

      <div className={styles.bookingRow}>
        <input name="firstName" placeholder={t("firstName")} required maxLength={60} aria-label={t("firstName")} />
        <input name="lastName" placeholder={t("lastName")} required maxLength={60} aria-label={t("lastName")} />
      </div>
      <input name="email" type="email" placeholder={t("email")} required maxLength={120} aria-label={t("email")} />
      <input name="phone" type="tel" placeholder={t("phone")} required maxLength={30} aria-label={t("phone")} />
      <input name="reason" placeholder={t("reason")} required maxLength={300} aria-label={t("reason")} />

      <select name="requestedAt" required aria-label={t("slot")} defaultValue="">
        <option value="" disabled>
          {slots === null ? t("loading") : slots.length ? t("choose") : t("none")}
        </option>
        {groups.map((group) => (
          <optgroup key={group.dayLabel} label={group.dayLabel}>
            {group.slots.map((slot) => (
              <option key={slot.iso} value={slot.iso}>
                {slot.timeLabel}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className={styles.bookingHint}>{t("hint")}</p>

      {status === "taken" ? <p className={styles.bookingError}>{t("taken")}</p> : null}
      {status === "error" ? <p className={styles.bookingError}>{t("error")}</p> : null}

      <button type="submit" className={styles.bookingSubmit} disabled={status === "sending" || !slots?.length}>
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
