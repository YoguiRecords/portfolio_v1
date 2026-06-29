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
      <p className="text-xs text-zinc-500">Éditeur JSON (validé à l&apos;enregistrement). Un éditeur visuel dédié pourra le remplacer.</p>
      <textarea
        className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-100"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} className="self-start rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Enregistrer
        </button>
        {status === "ok" ? <span className="text-sm text-emerald-400">Enregistré ✓</span> : null}
        {status === "err" ? <span className="text-sm text-red-400">Erreur : {error}</span> : null}
      </div>
    </div>
  );
}
