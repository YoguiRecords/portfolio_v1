"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

interface Stat {
  value: string;
  label: string;
}

const input = "rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-ink";

/** RESULTS block editor: a list of {value, label} stat cards. */
export function ResultsEditor({
  blockId,
  projectId,
  initial,
}: {
  blockId: string;
  projectId: string;
  initial: { stats?: Stat[] };
}) {
  const [stats, setStats] = useState<Stat[]>(initial.stats?.length ? initial.stats : [{ value: "", label: "" }]);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<Stat>) => setStats((prev) => prev.map((s, j) => (j === i ? { ...s, ...p } : s)));

  async function save() {
    const res = await updateBlockDataAction(blockId, projectId, { stats });
    setStatus(res.ok ? "ok" : "err");
    if (!res.ok) setError(res.error ?? "invalide");
  }

  return (
    <div className="flex flex-col gap-2">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={`${input} w-32`} value={s.value} placeholder="100%" onChange={(e) => patch(i, { value: e.target.value })} />
          <input className={`${input} flex-1`} value={s.label} placeholder="livré & en production" onChange={(e) => patch(i, { label: e.target.value })} />
          <button type="button" onClick={() => setStats((prev) => prev.filter((_, j) => j !== i))} className="rounded-md border border-border-strong px-2 py-1.5 text-sm text-muted hover:bg-surface-2">
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setStats((prev) => [...prev, { value: "", label: "" }])} className="rounded-md border border-border-strong px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
          + Stat
        </button>
        <button type="button" onClick={save} className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:bg-accent-strong">
          Enregistrer
        </button>
        {status === "ok" ? <span className="text-sm text-ok">Enregistré ✓</span> : null}
        {status === "err" ? <span className="text-sm text-danger">Erreur : {error}</span> : null}
      </div>
    </div>
  );
}
