"use client";

import { useState, type FormEvent } from "react";
import styles from "./chat-widget.module.css";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Public chatbot widget (client island). Sends the history to `/api/chat`; if
 * the chat is disabled (404) it shows a graceful notice. Guardrails live
 * server-side.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);

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
        setTurns((t) => [...t, { role: "assistant", content: "Le chat n'est pas disponible pour le moment." }]);
        return;
      }
      const data = (await res.json()) as { reply?: string };
      setTurns((t) => [...t, { role: "assistant", content: data.reply ?? "…" }]);
    } catch {
      setTurns((t) => [...t, { role: "assistant", content: "Une erreur est survenue." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.bubble}
        aria-label="Ouvrir le chat"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.5 6.1-.1 1-.6 2.4-1.4 3.4-.2.3 0 .7.4.6 2-.4 3.6-1.2 4.7-1.9 1 .2 1.9.3 2.8.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
          </svg>
        )}
      </button>
      {open ? (
        <section className={styles.panel} aria-label="Assistant de Yohan">
          <div className={styles.head}>Assistant de Yohan</div>
          <div className={styles.log}>
            {turns.length === 0 ? (
              <p className={`${styles.msg} ${styles.assistant}`}>
                Bonjour ! Posez-moi une question sur Yohan, ses projets ou pour planifier un échange.
              </p>
            ) : (
              turns.map((t, i) => (
                <p key={i} className={`${styles.msg} ${styles[t.role]}`}>
                  {t.content}
                </p>
              ))
            )}
          </div>
          <form className={styles.form} onSubmit={onSubmit}>
            <input name="q" placeholder="Votre message…" autoComplete="off" aria-label="Message" />
            <button type="submit" disabled={pending}>
              →
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
