"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

/**
 * Generic JSON editor for block types without a dedicated visual editor yet
 * (GAME_DESIGN, GALLERY, ANALYSIS, …). The payload is validated server-side
 * against the block's Zod schema on save, so invalid shapes are rejected.
 */
export function JsonEditor({
  blockId,
  projectId,
  initial,
}: {
  blockId: string;
  projectId: string;
  initial: unknown;
}) {
  const [text, setText] = useState(JSON.stringify(initial ?? {}, null, 2));
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function save() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setStatus("err");
      setError("JSON invalide");
      return;
    }
    const res = await updateBlockDataAction(blockId, projectId, parsed);
    setStatus(res.ok ? "ok" : "err");
    if (!res.ok) setError(res.error ?? "payload invalide");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">Éditeur JSON (validé à l&apos;enregistrement). Un éditeur visuel dédié pourra le remplacer.</p>
      <textarea
        className="rounded-md border border-border-strong bg-bg px-3 py-2 font-mono text-xs text-ink"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} className="self-start rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:bg-accent-strong">
          Enregistrer
        </button>
        {status === "ok" ? <span className="text-sm text-ok">Enregistré ✓</span> : null}
        {status === "err" ? <span className="text-sm text-danger">Erreur : {error}</span> : null}
      </div>
    </div>
  );
}
