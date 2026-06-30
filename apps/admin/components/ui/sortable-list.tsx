"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "./cn";

/** A single sortable row: an id + its (server-action-driven) content. */
export interface SortableRow {
  id: string;
  content: ReactNode;
}

function Row({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="flex items-start gap-2 p-3">
      <button
        type="button"
        aria-label="Réordonner (glisser)"
        className="mt-1 cursor-grab touch-none rounded px-1 text-muted hover:text-ink"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

/**
 * Generic drag-and-drop reorderable list. Renders `items` as rows with a drag
 * handle; on drop it persists the new order by calling `reorderAction` with a
 * comma-joined `ids` field. Optimistic locally, re-synced from server props.
 */
export function SortableList({
  items,
  reorderAction,
}: {
  items: SortableRow[];
  reorderAction: (form: FormData) => Promise<void>;
}) {
  // Only the id ORDER is local state (for optimistic drag). Content is always
  // read fresh from `items`, so inline edits never show stale data.
  const serverIds = items.map((i) => i.id);
  const [orderIds, setOrderIds] = useState<string[]>(serverIds);
  // Re-sync when the server sends a new set/ordering of ids (after revalidation).
  // Adjusting state during render (keyed on ids) is the React-recommended pattern
  // for "reset state when a prop changes" — no effect needed.
  const idsKey = serverIds.join(",");
  const [prevIdsKey, setPrevIdsKey] = useState(idsKey);
  if (idsKey !== prevIdsKey) {
    setPrevIdsKey(idsKey);
    setOrderIds(serverIds);
  }
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderIds.indexOf(String(active.id));
    const newIndex = orderIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderIds, oldIndex, newIndex);
    setOrderIds(next);
    const fd = new FormData();
    fd.set("ids", next.join(","));
    startTransition(() => {
      void reorderAction(fd);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted">Aucun élément.</div>
    );
  }

  const byId = new Map(items.map((i) => [i.id, i.content]));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
        <ul
          className={cn(
            "flex flex-col divide-y divide-border rounded-lg border border-border transition-opacity",
            pending && "opacity-70",
          )}
        >
          {orderIds.map((id) => (
            <Row key={id} id={id}>
              {byId.get(id)}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
