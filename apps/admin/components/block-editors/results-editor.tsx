"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

interface Stat {
  value: string;
  label: string;
}

const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100";

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
          <button type="button" onClick={() => setStats((prev) => prev.filter((_, j) => j !== i))} className="rounded-md border border-zinc-700 px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800">
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setStats((prev) => [...prev, { value: "", label: "" }])} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
          + Stat
        </button>
        <button type="button" onClick={save} className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Enregistrer
        </button>
        {status === "ok" ? <span className="text-sm text-emerald-400">Enregistré ✓</span> : null}
        {status === "err" ? <span className="text-sm text-red-400">Erreur : {error}</span> : null}
      </div>
    </div>
  );
}
