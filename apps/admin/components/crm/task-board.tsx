"use client";

import { useState } from "react";
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

function TaskCard({
  task,
  setStatus,
  onEdit,
}: {
  task: TaskCardRow;
  setStatus: TaskActions["setStatus"];
  onEdit: (task: TaskCardRow) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-control border border-border bg-surface-2 p-3">
      <button type="button" onClick={() => onEdit(task)} className="text-left text-sm font-medium text-ink hover:text-accent">
        {task.title}
      </button>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className={categoryTagClass(task.category)}>{CATEGORY_LABEL[task.category] ?? task.category}</Tag>
        {task.priority === "HIGH" ? <Tag className="bg-danger/10 text-danger">{PRIORITY_LABEL.HIGH}</Tag> : null}
        {task.contactName ? <span className="text-xs text-muted">{task.contactName}</span> : null}
      </div>
      <div className={cn("text-xs", isOverdue(task.dueAtIso) ? "font-semibold text-danger" : "text-muted")}>
        {formatDue(task.dueAtIso)}
      </div>
      <form action={setStatus}>
        <input type="hidden" name="id" value={task.id} />
        <select
          name="status"
          defaultValue={task.status}
          aria-label={`Déplacer ${task.title}`}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full rounded-control border border-border bg-surface px-2 py-1 text-xs text-ink-2 outline-none focus:border-accent"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}

/** Todo kanban: a column per `TaskStatus`, category + "today" filters, create/edit drawer. */
export function TaskBoard({
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

  const visible = tasks.filter((t) => {
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (todayOnly && t.dueAtIso?.slice(0, 10) !== todayKey()) return false;
    return true;
  });

  const drawerTask = editing;
  const drawerOpen = creating || editing !== null;
  const closeDrawer = () => {
    setCreating(false);
    setEditing(null);
  };

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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((status) => {
          const colTasks = visible.filter((t) => t.status === status);
          return (
            <section key={status} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-3">
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{STATUS_LABEL[status]}</h2>
                <span className="text-xs text-muted">{colTasks.length}</span>
              </header>
              <div className="flex flex-col gap-2">
                {colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} setStatus={actions.setStatus} onEdit={setEditing} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={drawerTask ? "Modifier la tâche" : "Nouvelle tâche"}>
        <form action={drawerTask ? actions.update : actions.create} className="flex flex-col gap-3">
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
          <form action={actions.remove} className="mt-3">
            <input type="hidden" name="id" value={drawerTask.id} />
            <Button variant="subtle" size="sm" type="submit">
              Supprimer
            </Button>
          </form>
        ) : null}
      </Drawer>
    </div>
  );
}
