"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

const ta = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100";

/** CONTEXT block editor: problem / objective / role. */
export function ContextEditor({
  blockId,
  projectId,
  initial,
}: {
  blockId: string;
  projectId: string;
  initial: { problem?: string; objective?: string; role?: string };
}) {
  const [problem, setProblem] = useState(initial.problem ?? "");
  const [objective, setObjective] = useState(initial.objective ?? "");
  const [role, setRole] = useState(initial.role ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function save() {
    const res = await updateBlockDataAction(blockId, projectId, { problem, objective, role });
    setStatus(res.ok ? "ok" : "err");
    if (!res.ok) setError(res.error ?? "invalide");
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Problème
        <textarea className={ta} rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Objectif
        <textarea className={ta} rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Rôle
        <input className={ta} value={role} onChange={(e) => setRole(e.target.value)} />
      </label>
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
