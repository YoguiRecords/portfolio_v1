"use client";

import dynamic from "next/dynamic";

export type { TaskActions, TaskCardRow } from "./task-board-view";

const STATUS_LABEL = ["À faire", "En cours", "Bloqué", "Terminé"];

/** Lightweight skeleton shown while the (client-only) drag & drop board loads. */
function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {STATUS_LABEL.map((label) => (
        <section key={label} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-3">
          <header className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</h2>
          </header>
          <div className="min-h-16 animate-pulse rounded-control bg-surface-2" />
        </section>
      ))}
    </div>
  );
}

/**
 * The drag & drop board (`@dnd-kit`) is **client-only**: `@dnd-kit` injects
 * accessibility attributes after mount that don't exist in the SSR markup,
 * which trips React hydration. Loading it with `ssr: false` renders a skeleton
 * server-side and swaps in the live board on the client — no mismatch.
 */
export const TaskBoard = dynamic(() => import("./task-board-view").then((m) => m.TaskBoardView), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});
