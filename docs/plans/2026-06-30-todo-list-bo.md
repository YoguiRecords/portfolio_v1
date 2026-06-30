# Todo-list complète au back office — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Doter le BO d'une todo-list unifiée (kanban 4 colonnes + catégories) en faisant évoluer le modèle CRM `CrmTask` en `Task` générique, avec une page `/taches` et une vue « du jour » sur Mission Control.

**Architecture:** Un seul modèle Prisma `Task` (rename de `CrmTask`, `@@map("CrmTask")` → table + GRANTs RBAC préservés, zéro perte de données). Enums `TaskCategory`/`TaskStatus`/`TaskPriority`. Logique côté serveur uniquement (Server Actions + Zod à la frontière). Kanban réutilisant le pattern `<select>` de `/pipeline` (aucune nouvelle dépendance).

**Tech Stack:** Next.js 16 (App Router, Server Actions), Prisma + PostgreSQL, Zod, Tailwind v4, Vitest, Playwright. Monorepo pnpm (`@portfolio/core`, `@portfolio/db`, `apps/admin`).

**Conventions:** travail sur branche `llm` ; commits Conventional Commits, atomiques, tests verts après chacun ; code/commentaires en anglais ; JSDoc sur les exports.

---

## Contexte fichiers (lecture utile avant de commencer)

- Schéma : `packages/db/prisma/schema.prisma` (modèle `CrmTask` L951 ; `tasks CrmTask[]` sur `Contact` L899 et `Deal` L923).
- Zod : `packages/core/src/crm/schemas.ts` (`CrmTaskInput` L52) ; barrel `packages/core/src/index.ts` (L69).
- Logique : `apps/admin/lib/crm/crm.ts` (section Tasks L73-85).
- Actions : `apps/admin/lib/actions/crm-actions.ts` (section Tasks L154-176).
- Mission Control : `apps/admin/lib/data/mission-control.ts`, `app/(dashboard)/mission-control/page.tsx`, test `lib/data/mission-control.test.ts`.
- Fiche contact : `apps/admin/app/(dashboard)/contacts/[id]/page.tsx` (Panel « Tâches / relances » L60-83).
- Kanban de réf. : `apps/admin/components/crm/pipeline-board.tsx` + `app/(dashboard)/pipeline/page.tsx`.
- Nav : `apps/admin/components/admin-nav/admin-nav.tsx` (`ADMIN_NAV` L32) ; icônes `apps/admin/components/admin-layout/icons.tsx`.

**Commandes test :** `pnpm --filter @portfolio/core test` · `pnpm --filter admin test`
(option RTK : `rtk vitest run`). Lint/types : `pnpm --filter admin lint` · `pnpm --filter admin typecheck`.

---

## Task 1: Enums & Zod `TaskInput` dans `@portfolio/core`

**Files:**
- Modify: `packages/core/src/crm/schemas.ts`
- Modify: `packages/core/src/index.ts:69`
- Test: `packages/core/src/crm/schemas.test.ts` (créer si absent)

**Step 1: Écrire le test qui échoue**

Créer/compléter `packages/core/src/crm/schemas.test.ts` :

```typescript
import { expect, test } from "vitest";
import { TaskInput, TASK_CATEGORIES, TASK_STATUSES, TASK_PRIORITIES } from "./schemas";

test("TaskInput: valeurs par défaut (catégorie GENERAL, statut TODO, priorité NORMAL)", () => {
  const parsed = TaskInput.parse({ title: "Créer la facture" });
  expect(parsed).toMatchObject({ title: "Créer la facture", category: "GENERAL", status: "TODO", priority: "NORMAL" });
});

test("TaskInput: rejette un titre vide", () => {
  expect(() => TaskInput.parse({ title: "" })).toThrow();
});

test("TaskInput: rejette une catégorie inconnue", () => {
  expect(() => TaskInput.parse({ title: "X", category: "NOPE" })).toThrow();
});

test("constantes exposées (4 catégories, 4 statuts, 3 priorités)", () => {
  expect(TASK_CATEGORIES).toHaveLength(4);
  expect(TASK_STATUSES).toEqual(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]);
  expect(TASK_PRIORITIES).toEqual(["LOW", "NORMAL", "HIGH"]);
});
```

**Step 2: Lancer le test → échec**

Run: `pnpm --filter @portfolio/core test`
Expected: FAIL (`TaskInput`/constantes non exportées).

**Step 3: Implémenter**

Dans `packages/core/src/crm/schemas.ts`, remplacer le bloc `CrmTaskInput` (L51-58) par :

```typescript
/** Task enumerations (mirror the Prisma enums). */
export const TASK_CATEGORIES = ["CRM", "CONTENT", "BILLING", "GENERAL"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;

/** Unified task (todo) input — CRM follow-ups and general todos share this shape. */
export const TaskInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  category: z.enum(TASK_CATEGORIES).default("GENERAL"),
  status: z.enum(TASK_STATUSES).default("TODO"),
  priority: z.enum(TASK_PRIORITIES).default("NORMAL"),
  dueAt: z.coerce.date().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});
```

Et les types (remplacer la ligne `export type CrmTaskInput…`) :

```typescript
export type TaskInput = z.infer<typeof TaskInput>;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
```

Dans `packages/core/src/index.ts`, remplacer `CrmTaskInput,` (L69) par :

```typescript
  TaskInput,
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
```

(Vérifier qu'aucun autre export ne référence `CrmTaskInput` : `grep -rn "CrmTaskInput" packages apps`.)

**Step 4: Lancer le test → succès**

Run: `pnpm --filter @portfolio/core test`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/core/src/crm/schemas.ts packages/core/src/crm/schemas.test.ts packages/core/src/index.ts
git commit -m "feat(core): unify CrmTaskInput into generic TaskInput with category/status/priority"
```

---

## Task 2: Schéma Prisma `Task` + migration (data-preserving)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (modèle `CrmTask` L951 ; relations `Contact.tasks` L899, `Deal.tasks` L923)
- Create: `packages/db/prisma/migrations/<timestamp>_task_unify/migration.sql`

**Step 1: Éditer le schéma**

Remplacer le modèle `CrmTask` (L951-969) par :

```prisma
enum TaskCategory {
  CRM
  CONTENT
  BILLING
  GENERAL
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  DONE
}

enum TaskPriority {
  LOW
  NORMAL
  HIGH
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  category    TaskCategory @default(GENERAL)
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(NORMAL)
  dueAt       DateTime?

  contactId String?
  contact   Contact? @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId    String?
  deal      Deal?    @relation(fields: [dealId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("CrmTask")
  @@index([dueAt])
  @@index([status])
  @@index([category])
  @@index([contactId])
  @@index([dealId])
}
```

Mettre à jour les relations inverses : `tasks CrmTask[]` → `tasks Task[]` sur `Contact` (L899) **et** `Deal` (L923).

**Step 2: Générer la migration en mode review (NE PAS appliquer aveuglément)**

Run: `pnpm --filter @portfolio/db exec prisma migrate dev --create-only --name task_unify`
Expected: un dossier de migration créé, **non appliqué**.

**Step 3: Éditer le SQL pour préserver les données `isDone`**

Le SQL auto-généré va `DROP COLUMN "isDone"` → **éditer** pour migrer la donnée d'abord. Le fichier doit ressembler à (ordre important) :

```sql
-- Enums
CREATE TYPE "TaskCategory" AS ENUM ('CRM', 'CONTENT', 'BILLING', 'GENERAL');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- Colonnes (status nullable d'abord pour backfill)
ALTER TABLE "CrmTask"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "category" "TaskCategory" NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "status" "TaskStatus";

-- Backfill : isDone → status ; tâches liées à un contact = catégorie CRM
UPDATE "CrmTask" SET "status" = CASE WHEN "isDone" THEN 'DONE'::"TaskStatus" ELSE 'TODO'::"TaskStatus" END;
UPDATE "CrmTask" SET "category" = 'CRM' WHERE "contactId" IS NOT NULL OR "dealId" IS NOT NULL;

-- Verrouiller status + défaut
ALTER TABLE "CrmTask" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "CrmTask" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- Nettoyage isDone + index associé
DROP INDEX IF EXISTS "CrmTask_isDone_idx";
ALTER TABLE "CrmTask" DROP COLUMN "isDone";

-- Nouveaux index
CREATE INDEX "CrmTask_status_idx" ON "CrmTask"("status");
CREATE INDEX "CrmTask_category_idx" ON "CrmTask"("category");
```

> ⚠️ Le rename de modèle `CrmTask` → `Task` ne touche PAS le SQL grâce à `@@map("CrmTask")` : la table, ses contraintes FK (`onDelete: Cascade`) et les REVOKE `app_web` du CRM restent intacts.

**Step 4: Appliquer la migration + régénérer le client**

Run: `pnpm --filter @portfolio/db exec prisma migrate dev` puis `pnpm --filter @portfolio/db exec prisma generate`
Expected: migration appliquée, client Prisma régénéré (modèle accessible via `prisma.task`).

**Step 5: Vérifier la compilation des types**

Run: `pnpm --filter admin typecheck`
Expected: erreurs UNIQUEMENT là où le code utilise encore `prisma.crmTask`/`isDone` (corrigées Tasks 3-6). Noter ces emplacements.

**Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations
git commit -m "feat(db): rename CrmTask to unified Task model (category/status/priority), data-preserving migration"
```

---

## Task 3: Logique serveur `lib/crm/crm.ts` (tasks)

**Files:**
- Modify: `apps/admin/lib/crm/crm.ts` (section Tasks L73-85 ; import L2 ; `getContact` include L31)
- Test: `apps/admin/lib/crm/crm.test.ts`

**Step 1: Écrire les tests qui échouent**

Ajouter à `apps/admin/lib/crm/crm.test.ts` :

```typescript
import { createTask, setTaskStatus, updateTask } from "./crm";

test("createTask : applique les défauts (GENERAL/TODO/NORMAL)", async () => {
  const create = vi.fn().mockResolvedValue({ id: "t1" });
  const prisma = { task: { create } } as unknown as PrismaClient;
  await createTask(prisma, { title: "Créer facture" });
  expect(create).toHaveBeenCalledWith({
    data: expect.objectContaining({ category: "GENERAL", status: "TODO", priority: "NORMAL" }),
  });
});

test("createTask : rejette un titre vide", async () => {
  const prisma = { task: { create: vi.fn() } } as unknown as PrismaClient;
  await expect(createTask(prisma, { title: "" })).rejects.toThrow();
});

test("setTaskStatus : rejette un statut inconnu", async () => {
  const prisma = { task: { update: vi.fn() } } as unknown as PrismaClient;
  await expect(setTaskStatus(prisma, "t1", "NOPE")).rejects.toThrow("invalid_status");
});

test("setTaskStatus : met à jour avec un statut valide", async () => {
  const update = vi.fn().mockResolvedValue({ id: "t1" });
  const prisma = { task: { update } } as unknown as PrismaClient;
  await setTaskStatus(prisma, "t1", "IN_PROGRESS");
  expect(update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { status: "IN_PROGRESS" } });
});
```

**Step 2: Lancer → échec**

Run: `pnpm --filter admin test -- crm.test`
Expected: FAIL (`prisma.task` / `setTaskStatus` / `updateTask` inexistants).

**Step 3: Implémenter**

Dans `crm.ts`, mettre à jour l'import (L2) : remplacer `CrmTaskInput` par `TaskInput, TASK_STATUSES`.
Dans `getContact` (L31), `tasks: true` reste valide (relation inchangée).
Remplacer la section `// ── Tasks ──` (L73-85) par :

```typescript
// ── Tasks (unified todo) ──
export function listTasks(prisma: PrismaClient) {
  return prisma.task.findMany({
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    include: { contact: true },
  });
}
export async function createTask(prisma: PrismaClient, raw: unknown) {
  return prisma.task.create({ data: TaskInput.parse(raw) });
}
export async function updateTask(prisma: PrismaClient, id: string, raw: unknown) {
  return prisma.task.update({ where: { id }, data: TaskInput.parse(raw) });
}
/** Moves a task to another kanban column (validated against the known statuses). */
export async function setTaskStatus(prisma: PrismaClient, id: string, status: string) {
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid_status: ${status}`);
  }
  return prisma.task.update({ where: { id }, data: { status: status as (typeof TASK_STATUSES)[number] } });
}
export async function deleteTask(prisma: PrismaClient, id: string) {
  await prisma.task.delete({ where: { id } });
}
```

(Supprimer l'ancien `setTaskDone`.)

**Step 4: Lancer → succès**

Run: `pnpm --filter admin test -- crm.test`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/admin/lib/crm/crm.ts apps/admin/lib/crm/crm.test.ts
git commit -m "feat(admin): task service (create/update/setStatus/delete) on unified Task model"
```

---

## Task 4: Server Actions `lib/actions/crm-actions.ts`

**Files:**
- Modify: `apps/admin/lib/actions/crm-actions.ts` (imports L19-21 ; section Tasks L154-176)

**Step 1: Implémenter (pas de test unitaire dédié — couvert par Playwright Task 8)**

Imports (L19-21) : remplacer `setTaskDone` par `updateTask, setTaskStatus`.

Remplacer la section `// ── Tasks ──` (L154-176) par :

```typescript
// ── Tasks (unified todo) ──
function taskData(form: FormData) {
  return {
    title: str(form, "title"),
    description: str(form, "description"),
    category: str(form, "category") ?? "GENERAL",
    status: str(form, "status") ?? "TODO",
    priority: str(form, "priority") ?? "NORMAL",
    dueAt: str(form, "dueAt"),
    contactId: str(form, "contactId"),
    dealId: str(form, "dealId"),
  };
}
function revalidateTaskViews(form: FormData): void {
  revalidatePath("/taches");
  revalidatePath("/mission-control");
  const contactId = str(form, "contactId");
  if (contactId) revalidatePath(`/contacts/${contactId}`);
}
export async function createTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await createTask(prisma, taskData(form));
  revalidateTaskViews(form);
}
export async function updateTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (!id) return;
  await updateTask(prisma, id, taskData(form));
  revalidateTaskViews(form);
}
export async function setTaskStatusAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  const status = str(form, "status");
  if (id && status) await setTaskStatus(prisma, id, status);
  revalidatePath("/taches");
  revalidatePath("/mission-control");
}
export async function deleteTaskAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = reqId(form);
  if (id) await deleteTask(prisma, id);
  revalidatePath("/taches");
  revalidatePath("/mission-control");
}
```

(Mettre à jour l'import en tête : `createTask, updateTask, setTaskStatus, deleteTask`.)

**Step 2: Vérifier types**

Run: `pnpm --filter admin typecheck`
Expected: plus d'erreur dans `crm-actions.ts` (restent celles de `contacts/[id]` + mission-control, Tasks 5-6).

**Step 3: Commit**

```bash
git add apps/admin/lib/actions/crm-actions.ts
git commit -m "feat(admin): task server actions (create/update/setStatus/delete)"
```

---

## Task 5: Mission Control — vue « Tâches du jour »

**Files:**
- Modify: `apps/admin/lib/data/mission-control.ts`
- Modify: `apps/admin/lib/data/mission-control.test.ts`
- Modify: `apps/admin/app/(dashboard)/mission-control/page.tsx`

**Step 1: Mettre à jour le test (échoue d'abord)**

Dans `mission-control.test.ts` : le mock `crmTask` doit devenir `task`, et on teste le filtre « du jour ». Remplacer la clé `crmTask` du mock prisma (L20) par `task`, ajuster les noms (`taskCount`, `taskFindMany`). Ajouter :

```typescript
test("tasks : ne renvoie que les tâches du jour (dueAt = aujourd'hui)", async () => {
  await getMissionControlData();
  const arg = db.taskFindMany.mock.calls[0][0];
  expect(arg.where.status).toEqual({ not: "DONE" });
  expect(arg.where.dueAt).toHaveProperty("gte");
  expect(arg.where.dueAt).toHaveProperty("lt");
});
```

Mettre à jour `pendingTasks` : `db.taskCount` mocké conservé ; l'assertion `kpis.pendingTasks` reste 2.

**Step 2: Lancer → échec**

Run: `pnpm --filter admin test -- mission-control`
Expected: FAIL.

**Step 3: Implémenter le filtre « du jour »**

Dans `mission-control.ts` :
- `prisma.crmTask.count` → `prisma.task.count({ where: { status: { not: "DONE" } } })`.
- Remplacer le `findMany` des tâches par un filtre date du jour :

```typescript
const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const endOfDay = new Date(startOfDay);
endOfDay.setDate(endOfDay.getDate() + 1);
// …
prisma.task.findMany({
  where: { status: { not: "DONE" }, dueAt: { gte: startOfDay, lt: endOfDay } },
  orderBy: { dueAt: "asc" },
  include: { contact: true },
}),
```

(Adapter le mapping `tasks` : champs `id`, `title`, `dueAtLabel`. `MissionTask` inchangé.)

**Step 4: Page Mission Control**

Dans `mission-control/page.tsx`, renommer le `Panel title="Tâches & relances"` (L86) en `title="Tâches du jour"`, ajouter une `action` lien « Tout voir » → `/taches` (même pattern que le panneau Inbox L101), et message vide « Aucune tâche aujourd'hui. ».

**Step 5: Lancer → succès**

Run: `pnpm --filter admin test -- mission-control`
Expected: PASS.

**Step 6: Commit**

```bash
git add apps/admin/lib/data/mission-control.ts apps/admin/lib/data/mission-control.test.ts "apps/admin/app/(dashboard)/mission-control/page.tsx"
git commit -m "feat(admin): Mission Control shows today's tasks only, link to /taches"
```

---

## Task 6: Fiche contact — adapter à `Task`

**Files:**
- Modify: `apps/admin/app/(dashboard)/contacts/[id]/page.tsx` (Panel « Tâches / relances » L60-83)

**Step 1: Implémenter**

- Import (L6) : remplacer `setTaskDoneAction` par `setTaskStatusAction`.
- La coche « Fait/Rouvrir » : remplacer le formulaire `setTaskDoneAction` (L65-71) par `setTaskStatusAction` avec `status` cible :

```tsx
<form action={setTaskStatusAction}>
  <input type="hidden" name="id" value={t.id} />
  <input type="hidden" name="status" value={t.status === "DONE" ? "TODO" : "DONE"} />
  <Button variant="subtle" size="sm" type="submit">
    {t.status === "DONE" ? "Rouvrir" : "Fait"}
  </Button>
</form>
```

- L'affichage barré : `t.isDone` → `t.status === "DONE"` (L64).
- Le form de création (L75) : ajouter un champ caché `category=CRM` (les tâches créées depuis une fiche contact sont CRM) ; `contactId` déjà présent.

**Step 2: Vérifier types + lint**

Run: `pnpm --filter admin typecheck && pnpm --filter admin lint`
Expected: PASS (plus aucune référence à `isDone`/`setTaskDone`/`crmTask` ; `grep -rn "isDone\|setTaskDone\|crmTask" apps/admin` → vide).

**Step 3: Commit**

```bash
git add "apps/admin/app/(dashboard)/contacts/[id]/page.tsx"
git commit -m "feat(admin): contact tasks use status workflow, default category CRM"
```

---

## Task 7: Page `/taches` (kanban) + nav

**Files:**
- Create: `apps/admin/app/(dashboard)/taches/page.tsx`
- Create: `apps/admin/components/crm/task-board.tsx`
- Modify: `apps/admin/components/admin-layout/icons.tsx` (ajouter icône `task`)
- Modify: `apps/admin/components/admin-nav/admin-nav.tsx` (`ADMIN_NAV`)

**Step 1: Icône**

Dans `icons.tsx`, ajouter dans `PATHS` :

```typescript
  task: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
```

**Step 2: Entrée de nav**

Dans `admin-nav.tsx`, `ADMIN_NAV`, ajouter après l'entrée `/contacts` (L45) :

```typescript
  { href: "/taches", label: "Tâches", icon: "task", group: "Relation client" },
```

**Step 3: Composant `task-board.tsx`** (client, pattern `pipeline-board.tsx`)

Créer `apps/admin/components/crm/task-board.tsx` : board à 4 colonnes (`TaskStatus`), chaque carte a un `<select>` de statut (onChange → submit `setStatus`), badges catégorie/priorité, échéance (rouge si `< aujourd'hui`), nom contact si présent. Filtres : boutons catégorie (`ALL` + 4) + onglet « Du jour ». Drawer création/édition (titre, description, catégorie, statut, priorité, dueAt `datetime-local`, contact `<select>` optionnel). Réutiliser `Button`, `Drawer`, `Input`, `Select` de `@/components/ui`. Miroir local des constantes :

```typescript
const STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
const STATUS_LABEL: Record<string, string> = { TODO: "À faire", IN_PROGRESS: "En cours", BLOCKED: "Bloqué", DONE: "Terminé" };
const CATEGORIES = ["CRM", "CONTENT", "BILLING", "GENERAL"] as const;
const CATEGORY_LABEL: Record<string, string> = { CRM: "CRM", CONTENT: "Contenu", BILLING: "Facturation", GENERAL: "Général" };
const PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;
const PRIORITY_LABEL: Record<string, string> = { LOW: "Basse", NORMAL: "Normale", HIGH: "Haute" };
```

Props : `tasks: TaskCardRow[]`, `contacts: {id,name}[]`, `actions: { setStatus, create, update, remove }`. Filtre « Du jour » : `task.dueAtIso` tombe sur la date du jour. Couleurs via tokens DA (`text-accent`, `bg-surface-2`, badge catégorie teinte or pour CRM, etc. — cf. `DESIGN_SYSTEM.md`, pas de couleur en dur hors tokens Tailwind existants).

**Step 4: Page serveur `taches/page.tsx`**

```tsx
import { prisma } from "@portfolio/db";
import { listTasks, listContacts } from "@/lib/crm/crm";
import { createTaskAction, updateTaskAction, setTaskStatusAction, deleteTaskAction } from "@/lib/actions/crm-actions";
import { TaskBoard, type TaskCardRow } from "@/components/crm/task-board";

export const dynamic = "force-dynamic";

/** Todo board: unified tasks (CRM + general) by status, with category filters. */
export default async function TachesPage() {
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
```

**Step 5: Vérifier build/lint/types**

Run: `pnpm --filter admin typecheck && pnpm --filter admin lint`
Expected: PASS.

**Step 6: Commit**

```bash
git add "apps/admin/app/(dashboard)/taches/page.tsx" apps/admin/components/crm/task-board.tsx apps/admin/components/admin-layout/icons.tsx apps/admin/components/admin-nav/admin-nav.tsx
git commit -m "feat(admin): /taches kanban board (status columns + category filters)"
```

---

## Task 8: E2E Playwright

**Files:**
- Create: `apps/admin/e2e/taches.spec.ts` (adapter au dossier e2e existant — vérifier `apps/admin` pour la convention `*.spec.ts` et le helper de login)

**Step 1: Écrire le test**

Parcours : login BO (réutiliser le helper d'auth existant) → `/taches` → créer une tâche (catégorie GENERAL) → vérifier qu'elle apparaît dans la colonne « À faire » → changer son `<select>` en « En cours » → vérifier le déplacement de colonne. Si un helper login n'existe pas, suivre le pattern des specs existantes.

**Step 2: Lancer → vérifier**

Run: `pnpm --filter admin test:e2e -- taches`
Expected: PASS (ou documenter le pré-requis stack docker/local si l'E2E nécessite la DB).

**Step 3: Commit**

```bash
git add apps/admin/e2e/taches.spec.ts
git commit -m "test(admin): e2e create task and move across kanban columns"
```

---

## Task 9: Documentation (clôture — avant tout push)

**Files:**
- Modify: `PROGRESS.md`, `TASKS.md`
- Modify: `docs/patch_notes/patch_note_V0_5.md`
- Modify: `docs/technical/API_REFERENCE.md` (nouvelles actions `createTaskAction`/`updateTaskAction`/`setTaskStatusAction`/`deleteTaskAction`)

**Step 1: Mettre à jour**

- `PROGRESS.md` : réécrire l'état courant (todo-list livrée).
- `TASKS.md` : retirer/cocher la tâche todo-list du backlog.
- Patch note : entrée datée (feature todo-list unifiée, kanban, vue du jour).
- `API_REFERENCE.md` : documenter les Server Actions de tâches (signature FormData, champs, revalidation).
- `ARCHITECTURE.md` / `SECURITY.md` : **non impactés** (aucun service/réseau/posture modifié ; table + GRANTs RBAC préservés via `@@map`).

**Step 2: Vérification finale complète**

Run: `pnpm --filter @portfolio/core test && pnpm --filter admin test && pnpm --filter admin lint && pnpm --filter admin typecheck && pnpm --filter admin build`
Expected: tout vert.

**Step 3: Commit**

```bash
git add PROGRESS.md TASKS.md docs/
git commit -m "docs: document unified task todo-list for v0.5"
```

---

## Definition of Done

- [ ] `pnpm --filter @portfolio/core test` · `pnpm --filter admin test` verts.
- [ ] `lint` + `typecheck` + `build` admin verts ; `grep -rn "isDone\|setTaskDone\|crmTask\|CrmTaskInput" apps packages` → vide (hors `generated/`).
- [ ] Migration data-preserving vérifiée (tâches existantes : `isDone=true` → `DONE`, liées → `CRM`).
- [ ] `/taches` : créer / éditer / déplacer / supprimer une tâche, filtres catégorie + « du jour ».
- [ ] Mission Control n'affiche que les tâches du jour + lien vers `/taches`.
- [ ] Docs mises à jour (PROGRESS, TASKS, patch note, API_REFERENCE).
- [ ] PR `llm → dev` ouverte uniquement quand la CI est verte (jamais de merge rouge).
