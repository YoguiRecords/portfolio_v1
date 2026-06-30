"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
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
  const [order, setOrder] = useState<SortableRow[]>(items);
  // Re-sync when the server sends a new ordering (after revalidation).
  useEffect(() => setOrder(items), [items]);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((i) => i.id === active.id);
    const newIndex = order.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    const fd = new FormData();
    fd.set("ids", next.map((i) => i.id).join(","));
    startTransition(() => {
      void reorderAction(fd);
    });
  }

  if (order.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted">Aucun élément.</div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul
          className={cn(
            "flex flex-col divide-y divide-border rounded-lg border border-border transition-opacity",
            pending && "opacity-70",
          )}
        >
          {order.map((i) => (
            <Row key={i.id} id={i.id}>
              {i.content}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
