"use client";

import { useState } from "react";
import styles from "./localized-field.module.css";

interface LocalizedFieldProps {
  /** Field label (FR). */
  label: string;
  /** Current FR value (source of truth). */
  frValue: string;
  /** Current EN overlay value (may be empty). */
  enValue?: string;
  /** Whether the current EN was AI-generated (vs hand-edited). */
  isAuto?: boolean;
  /** Render a multiline textarea instead of a single-line input. */
  multiline?: boolean;
  /** Called when the FR value changes. */
  onChangeFr: (value: string) => void;
  /** Called to persist a manual EN edit (marks it `isAuto=false`). */
  onSaveEn: (value: string) => void;
  /** Called to regenerate the EN from the current FR (AI). */
  onRegenerate?: () => void;
}

/**
 * Back-office field with a collapsible EN overlay. The FR value is always shown;
 * the EN version is hidden by default and revealed by the EN toggle. In EN mode
 * the admin can edit and **save the EN manually** (`isAuto=false`) or regenerate
 * it. A note reminds that any FR change re-overwrites the EN.
 */
export function LocalizedField({
  label,
  frValue,
  enValue = "",
  isAuto = true,
  multiline = false,
  onChangeFr,
  onSaveEn,
  onRegenerate,
}: LocalizedFieldProps) {
  const [enOpen, setEnOpen] = useState(false);
  const [enDraft, setEnDraft] = useState(enValue);

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label}>{label}</label>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={enOpen}
          onClick={() => setEnOpen((v) => !v)}
        >
          🇬🇧 EN
        </button>
      </div>

      {multiline ? (
        <textarea
          className={styles.textarea}
          value={frValue}
          onChange={(e) => onChangeFr(e.target.value)}
        />
      ) : (
        <input
          className={styles.input}
          value={frValue}
          onChange={(e) => onChangeFr(e.target.value)}
        />
      )}

      {enOpen ? (
        <div className={styles.en}>
          <span className={`${styles.badge} ${isAuto ? styles.badgeAuto : styles.badgeManual}`}>
            {isAuto ? "auto" : "édité"}
          </span>
          <label className={styles.label} htmlFor="en-value">
            Version anglaise
          </label>
          <textarea
            id="en-value"
            className={styles.textarea}
            value={enDraft}
            onChange={(e) => setEnDraft(e.target.value)}
          />
          <div className={styles.actions}>
            <button type="button" onClick={() => onSaveEn(enDraft)}>
              Sauvegarder l&apos;EN
            </button>
            {onRegenerate ? (
              <button type="button" onClick={onRegenerate}>
                Régénérer
              </button>
            ) : null}
          </div>
          <p className={styles.note}>
            Toute modification du texte français réécrasera automatiquement l&apos;anglais.
          </p>
        </div>
      ) : null}
    </div>
  );
}
