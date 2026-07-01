import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { listTasks, listContacts } from "@/lib/crm/crm";
import { createTaskAction, updateTaskAction, setTaskStatusAction, deleteTaskAction } from "@/lib/actions/crm-actions";
import { TaskBoard, type TaskCardRow } from "@/components/crm/task-board";

export const dynamic = "force-dynamic";

/** Todo board: unified tasks (CRM + general) by status, with category filters. */
export default async function TachesPage() {
  await requirePermission("tasks");
  const [tasks, contacts] = await Promise.all([listTasks(prisma), listContacts(prisma)]);
  const cards: TaskCardRow[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    status: t.status,
    priority: t.priority,
    dueAtIso: t.dueAt ? t.dueAt.toISOString() : null,
    contactName: t.contact ? `${t.contact.firstName} ${t.contact.lastName ?? ""}`.trim() : null,
    contactId: t.contactId,
  }));
  const contactOptions = contacts.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim() }));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tâches</h1>
        <p className="text-sm text-muted">Toutes les choses à faire : CRM, contenu, facturation, divers.</p>
      </div>
      <TaskBoard
        tasks={cards}
        contacts={contactOptions}
        actions={{ setStatus: setTaskStatusAction, create: createTaskAction, update: updateTaskAction, remove: deleteTaskAction }}
      />
    </div>
  );
}
