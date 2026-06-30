"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

/** TEXT block editor: a single markdown field. */
export function TextEditor({
  blockId,
  projectId,
  initial,
}: {
  blockId: string;
  projectId: string;
  initial: { markdown?: string };
}) {
  const [markdown, setMarkdown] = useState(initial.markdown ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function save() {
    const res = await updateBlockDataAction(blockId, projectId, { markdown });
    setStatus(res.ok ? "ok" : "err");
    if (!res.ok) setError(res.error ?? "invalide");
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="rounded-md border border-border-strong bg-surface px-3 py-2 font-mono text-sm text-ink"
        rows={8}
        value={markdown}
        placeholder="Markdown…"
        onChange={(e) => setMarkdown(e.target.value)}
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
