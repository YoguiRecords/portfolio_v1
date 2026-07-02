"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import styles from "./chat-widget.module.css";
import { BookingForm } from "./booking-form";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Public chatbot widget (client island). Sends the history to `/api/chat`; if
 * the chat is disabled (404) it shows a graceful notice. Guardrails live
 * server-side. The log is a polite live region so assistant replies are
 * announced to screen readers.
 */
export function ChatWidget({
  enabled = true,
  name = "Friday",
  avatarUrl = null,
}: {
  enabled?: boolean;
  name?: string;
  avatarUrl?: string | null;
}) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);

  if (!enabled) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const text = input.value.trim();
    if (!text || pending) return;
    const next: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    input.value = "";
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 404) {
        setTurns((current) => [...current, { role: "assistant", content: t("unavailable") }]);
        return;
      }
      const data = (await res.json()) as { reply?: string };
      setTurns((current) => [...current, { role: "assistant", content: data.reply ?? "…" }]);
    } catch {
      setTurns((current) => [...current, { role: "assistant", content: t("error") }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.bubble}
        aria-label={t("open", { name })}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.bubbleAvatar} src={avatarUrl} alt="" width={56} height={56} />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.5 6.1-.1 1-.6 2.4-1.4 3.4-.2.3 0 .7.4.6 2-.4 3.6-1.2 4.7-1.9 1 .2 1.9.3 2.8.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
          </svg>
        )}
      </button>
      {open ? (
        <section className={styles.panel} aria-label={`${name} · ${t("assistantRole")}`}>
          <div className={styles.head}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatar} src={avatarUrl} alt="" width={28} height={28} />
            ) : (
              <span className={styles.avatarFallback} aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span>
              {name} · {t("assistantRole")}
            </span>
            <button
              type="button"
              className={styles.bookCta}
              onClick={() => setBooking((v) => !v)}
              aria-pressed={booking}
            >
              {booking ? t("backToChat") : t("book")}
            </button>
          </div>
          {booking ? (
            <div className={styles.log}>
              <BookingForm onClose={() => setBooking(false)} />
            </div>
          ) : (
            <div className={styles.log} role="log" aria-live="polite">
              {turns.length === 0 ? (
                <p className={`${styles.msg} ${styles.assistant}`}>{t("greeting", { name })}</p>
              ) : (
                turns.map((turn, index) => (
                  <p key={index} className={`${styles.msg} ${styles[turn.role]}`}>
                    {turn.content}
                  </p>
                ))
              )}
              {pending ? (
                <p className={`${styles.msg} ${styles.assistant} ${styles.typing}`}>{t("typing", { name })}</p>
              ) : null}
            </div>
          )}
          {booking ? null : (
            <form className={styles.form} onSubmit={onSubmit}>
              <input name="q" placeholder={t("placeholder")} autoComplete="off" aria-label={t("messageLabel")} />
              <button type="submit" disabled={pending}>
                →
              </button>
            </form>
          )}
        </section>
      ) : null}
    </>
  );
}
