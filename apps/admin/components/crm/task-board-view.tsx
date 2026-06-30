"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Button, Drawer, Input, Select, Tag, Textarea, cn } from "@/components/ui";

/** Kanban statuses (mirror of Prisma `TaskStatus` — local to stay client-side). */
const STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
const STATUS_LABEL: Record<string, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloqué",
  DONE: "Terminé",
};
const CATEGORIES = ["CRM", "CONTENT", "BILLING", "GENERAL"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  CRM: "CRM",
  CONTENT: "Contenu",
  BILLING: "Facturation",
  GENERAL: "Général",
};
const PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;
const PRIORITY_LABEL: Record<string, string> = { LOW: "Basse", NORMAL: "Normale", HIGH: "Haute" };

/** Task card row for the board (serialisable from the server page). */
export interface TaskCardRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  dueAtIso: string | null;
  contactName: string | null;
  contactId: string | null;
}

export interface TaskActions {
  setStatus: (form: FormData) => Promise<void>;
  create: (form: FormData) => Promise<void>;
  update: (form: FormData) => Promise<void>;
  remove: (form: FormData) => Promise<void>;
}

/** `YYYY-MM-DD` for "today" (local time). */
function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** True when the due date is strictly before today (overdue). */
function isOverdue(dueAtIso: string | null): boolean {
  if (!dueAtIso) return false;
  return dueAtIso.slice(0, 10) < todayKey();
}

function formatDue(dueAtIso: string | null): string {
  if (!dueAtIso) return "—";
  return new Date(dueAtIso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function categoryTagClass(category: string): string {
  // Gold tint for CRM (signature accent), neutral for the rest (DA tokens only).
  return category === "CRM" ? "bg-accent/10 text-accent" : "bg-surface-2 text-ink-2";
}

/** Card visual (shared by the draggable card and the drag overlay). */
function CardBody({ task, dragging }: { task: TaskCardRow; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-control border bg-surface-2 p-3",
        dragging ? "border-accent shadow-lg" : "border-border",
      )}
    >
      <div className="text-sm font-medium text-ink">{task.title}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className={categoryTagClass(task.category)}>{CATEGORY_LABEL[task.category] ?? task.category}</Tag>
        {task.priority === "HIGH" ? <Tag className="bg-danger/10 text-danger">{PRIORITY_LABEL.HIGH}</Tag> : null}
        {task.contactName ? <span className="text-xs text-muted">{task.contactName}</span> : null}
      </div>
      <div className={cn("text-xs", isOverdue(task.dueAtIso) ? "font-semibold text-danger" : "text-muted")}>
        {formatDue(task.dueAtIso)}
      </div>
    </div>
  );
}

/** Draggable task card: drag to move across columns, tap/click the title to edit. */
function DraggableCard({ task, onEdit }: { task: TaskCardRow; onEdit: (task: TaskCardRow) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      role="button"
      aria-label={`Tâche ${task.title} — glisser pour déplacer, activer pour modifier`}
      className={cn("cursor-grab touch-none rounded-control outline-none focus:ring-1 focus:ring-accent", isDragging && "opacity-40")}
    >
      <CardBody task={task} />
    </div>
  );
}

/** Droppable kanban column; highlights when a card hovers over it. */
function Column({ status, count, children }: { status: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-card border bg-surface p-3 transition-colors",
        isOver ? "border-accent bg-accent/5" : "border-border",
      )}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{STATUS_LABEL[status]}</h2>
        <span className="text-xs text-muted">{count}</span>
      </header>
      <div className="flex min-h-16 flex-col gap-2">{children}</div>
    </section>
  );
}

/** Todo kanban: drag & drop across `TaskStatus` columns, category + "today" filters, create/edit drawer. */
export function TaskBoardView({
  tasks,
  contacts,
  actions,
}: {
  tasks: TaskCardRow[];
  contacts: { id: string; name: string }[];
  actions: TaskActions;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TaskCardRow | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [todayOnly, setTodayOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Two-step delete guard: the first click only arms the confirmation (anti misclick).
  const [armedDelete, setArmedDelete] = useState(false);
  // Optimistic status overrides for snappy drag feedback before the server
  // revalidates (derived over props — no effect, no stale local copy).
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const localTasks = tasks.map((t) => (pendingStatus[t.id] ? { ...t, status: pendingStatus[t.id] } : t));

  // PointerSensor (mouse + touch) with a small activation distance so taps still
  // open the editor; KeyboardSensor keeps the board operable without a pointer.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const visible = localTasks.filter((t) => {
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (todayOnly && t.dueAtIso?.slice(0, 10) !== todayKey()) return false;
    return true;
  });

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const newStatus = String(over.id);
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    // Optimistic update, then persist via the server action.
    setPendingStatus((prev) => ({ ...prev, [taskId]: newStatus }));
    const fd = new FormData();
    fd.set("id", taskId);
    fd.set("status", newStatus);
    void actions.setStatus(fd);
  }

  const drawerTask = editing;
  const drawerOpen = creating || editing !== null;
  const closeDrawer = () => {
    setCreating(false);
    setEditing(null);
    setArmedDelete(false);
  };
  const openEdit = (task: TaskCardRow) => {
    setArmedDelete(false);
    setEditing(task);
  };
  // Run a server action from the drawer, then close it once it resolves (so the
  // drawer never lingers with stale/deleted data). Stays open if the action throws.
  const runAndClose = (action: (form: FormData) => Promise<void>) => async (form: FormData) => {
    await action(form);
    closeDrawer();
  };
  const activeTask = activeId ? localTasks.find((t) => t.id === activeId) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "rounded-control px-2.5 py-1 text-xs transition-colors",
                categoryFilter === c ? "bg-accent/15 font-semibold text-accent" : "text-ink-2 hover:bg-surface-2",
              )}
            >
              {c === "ALL" ? "Toutes" : CATEGORY_LABEL[c]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTodayOnly((v) => !v)}
            className={cn(
              "rounded-control px-2.5 py-1 text-xs transition-colors",
              todayOnly ? "bg-accent/15 font-semibold text-accent" : "text-ink-2 hover:bg-surface-2",
            )}
          >
            Du jour
          </button>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          Nouvelle tâche
        </Button>
      </div>

      <p className="text-xs text-muted">Glissez une carte d’une colonne à l’autre pour changer son statut.</p>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => {
            const colTasks = visible.filter((t) => t.status === status);
            return (
              <Column key={status} status={status} count={colTasks.length}>
                {colTasks.map((t) => (
                  <DraggableCard key={t.id} task={t} onEdit={openEdit} />
                ))}
              </Column>
            );
          })}
        </div>
        <DragOverlay>{activeTask ? <CardBody task={activeTask} dragging /> : null}</DragOverlay>
      </DndContext>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={drawerTask ? "Modifier la tâche" : "Nouvelle tâche"}>
        <form action={runAndClose(drawerTask ? actions.update : actions.create)} className="flex flex-col gap-3">
          {drawerTask ? <input type="hidden" name="id" value={drawerTask.id} /> : null}
          <Input name="title" placeholder="Titre" required defaultValue={drawerTask?.title ?? ""} />
          <Textarea name="description" placeholder="Description (optionnel)" rows={3} defaultValue={drawerTask?.description ?? ""} />
          <Select name="category" defaultValue={drawerTask?.category ?? "GENERAL"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={drawerTask?.status ?? "TODO"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select name="priority" defaultValue={drawerTask?.priority ?? "NORMAL"}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>
          <Input name="dueAt" type="datetime-local" defaultValue={drawerTask?.dueAtIso?.slice(0, 16) ?? ""} />
          <Select name="contactId" defaultValue={drawerTask?.contactId ?? ""}>
            <option value="">Aucun contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button variant="primary" type="submit">
            {drawerTask ? "Enregistrer" : "Créer"}
          </Button>
        </form>
        {drawerTask ? (
          <div className="mt-4 border-t border-border pt-3">
            {armedDelete ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink-2">Confirmer la suppression de « {drawerTask.title} » ?</p>
                <form action={runAndClose(actions.remove)} className="flex gap-2">
                  <input type="hidden" name="id" value={drawerTask.id} />
                  <Button variant="danger" size="sm" type="submit">
                    Supprimer définitivement
                  </Button>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setArmedDelete(false)}>
                    Annuler
                  </Button>
                </form>
              </div>
            ) : (
              <Button variant="subtle" size="sm" type="button" onClick={() => setArmedDelete(true)}>
                Supprimer
              </Button>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
