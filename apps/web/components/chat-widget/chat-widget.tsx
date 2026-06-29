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
        {open ? "×" : "💬"}
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
