"use client";

import { useState } from "react";
import { updateBlockDataAction } from "@/lib/actions/block-actions";

interface Phase {
  label: string;
  start: number;
  width: number;
  style?: "green" | "dark" | "soft";
}

const BAR_COLOR: Record<string, string> = {
  green: "bg-emerald-400 text-emerald-950",
  dark: "bg-zinc-700 text-zinc-100",
  soft: "bg-amber-500/20 text-amber-300 border border-amber-500/50",
};

/**
 * BO editor for a PROCESS (Gantt) block. Each phase has a label and a position on
 * the 0–100 timeline (start% + width%). A live preview shows the real durations;
 * Save validates the payload via the shared Zod schema (same as the public renderer).
 */
export function ProcessEditor({
  blockId,
  projectId,
  initial,
}: {
  blockId: string;
  projectId: string;
  initial: Phase[];
}) {
  const [phases, setPhases] = useState<Phase[]>(
    initial.length ? initial : [{ label: "Cadrage", start: 0, width: 20 }],
  );
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [error, setError] = useState<string>("");

  const patch = (i: number, p: Partial<Phase>) =>
    setPhases((prev) => prev.map((ph, j) => (j === i ? { ...ph, ...p } : ph)));
  const remove = (i: number) => setPhases((prev) => prev.filter((_, j) => j !== i));
  const add = () => setPhases((prev) => [...prev, { label: "Nouvelle phase", start: 0, width: 20 }]);

  async function save() {
    setStatus("saving");
    const res = await updateBlockDataAction(blockId, projectId, { phases });
    if (res.ok) {
      setStatus("ok");
    } else {
      setStatus("err");
      setError(res.error ?? "invalide");
    }
  }

  const num = "w-20 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100";

  return (
    <div className="flex flex-col gap-4">
      {/* Aperçu visuel en direct */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
        {phases.map((ph, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr] items-center gap-3">
            <span className="truncate text-right font-mono text-xs text-zinc-400">{ph.label}</span>
            <div className="relative h-5 rounded bg-zinc-900">
              <div
                className={`absolute inset-y-0.5 flex items-center rounded px-2 text-[10px] font-bold ${
                  ph.style ? BAR_COLOR[ph.style] : "bg-amber-500 text-amber-950"
                }`}
                style={{ left: `${ph.start}%`, width: `${ph.width}%` }}
              >
                {ph.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Édition des phases */}
      <div className="flex flex-col gap-2">
        {phases.map((ph, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-800 p-2">
            <input
              className="min-w-40 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
              value={ph.label}
              onChange={(e) => patch(i, { label: e.target.value })}
              placeholder="Libellé de la tâche"
            />
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              Début %
              <input
                type="number"
                min={0}
                max={100}
                className={num}
                value={ph.start}
                onChange={(e) => patch(i, { start: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              Durée %
              <input
                type="number"
                min={0}
                max={100}
                className={num}
                value={ph.width}
                onChange={(e) => patch(i, { width: Number(e.target.value) })}
              />
            </label>
            <select
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100"
              value={ph.style ?? ""}
              onChange={(e) => patch(i, { style: (e.target.value || undefined) as Phase["style"] })}
            >
              <option value="">Or</option>
              <option value="green">Vert</option>
              <option value="dark">Sombre</option>
              <option value="soft">Doux</option>
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-md border border-zinc-700 px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
          + Ajouter une phase
        </button>
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-600"
        >
          {status === "saving" ? "Enregistrement…" : "Enregistrer le Gantt"}
        </button>
        {status === "ok" ? <span className="text-sm text-emerald-400">Enregistré ✓</span> : null}
        {status === "err" ? <span className="text-sm text-red-400">Erreur : {error}</span> : null}
      </div>
    </div>
  );
}
