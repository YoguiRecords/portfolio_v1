# Design — Todo-list complète au back office

> Date : 2026-06-30 · Statut : validé (brainstorming) · Branche : `llm`

## Objectif

Donner au back office une **vraie todo-list unifiée** : un seul endroit où vivent toutes
les choses à faire (relances CRM, appels, factures, ajout de projet/article, divers),
réparties en **catégories** et pilotées en **kanban**.

Deux vues sur les **mêmes** tâches :
- **Mission Control** → uniquement les **tâches du jour** (échéance = aujourd'hui), coche rapide.
- **Page `/taches`** → **kanban complet** (4 colonnes de statut) + filtres (catégorie, « du jour »).

## Décision d'architecture — un seul modèle `Task`

On **fait évoluer `CrmTask` en `Task` générique** (rename) plutôt que créer un système
parallèle. Une tâche CRM = une `Task` avec `category = CRM` + lien contact ; une tâche
« créer facture » = `Task` `category = BILLING` sans lien.

Rationale :
- L'utilisateur veut **une seule todo** → deux tables forceraient une couche d'agrégation
  partout (kanban, filtre « du jour », compteurs) + duplication de `status`/`priority`/`category`.
- L'isolation CRM est préservée **ligne par ligne** : `contactId`/`dealId` restent
  `onDelete: Cascade`. Supprimer un contact ne supprime **que** ses tâches liées ; une tâche
  `GENERAL`/`BILLING` (liens null) n'est jamais affectée.
- DRY, pas de second système à maintenir. Naming explicite (`Task`).

## 1. Données (Prisma) — `packages/db`

Migration : enrichir la table existante (modèle renommé `Task`, **`@@map("CrmTask")`** →
table conservée, **aucune perte de données**).

```prisma
enum TaskCategory { CRM CONTENT BILLING GENERAL }
enum TaskStatus   { TODO IN_PROGRESS BLOCKED DONE }
enum TaskPriority { LOW NORMAL HIGH }

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?                          // notes libres
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

- `isDone` (booléen actuel) → remplacé par `status` (`DONE` = terminé). Migration data :
  `isDone = true` ⇒ `status = DONE`, sinon `TODO`.
- Relations inverses `Contact.tasks` / `Deal.tasks` : type renommé `Task` (références mises à jour).

## 2. Validation (`packages/core`)

- Constantes (source unique UI + DB) : `TASK_CATEGORIES`, `TASK_STATUSES`, `TASK_PRIORITIES`.
- `TaskInput` (Zod) : `title` (requis), `description?`, `category`, `status`, `priority`,
  `dueAt?` (coerce date), `contactId?`, `dealId?`. (Remplace `CrmTaskInput`.)

## 3. Logique & Server Actions (`apps/admin`)

`lib/crm/crm.ts` (section Tasks) :
- `listTasks` (conservé), `createTask` (enrichi), `deleteTask` (conservé)
- **`updateTask`** (édition complète), **`setTaskStatus`** (changement de colonne kanban)
- `setTaskDone` supprimé au profit de `setTaskStatus`.

`lib/actions/crm-actions.ts` :
- `createTaskAction` (enrichie), **`updateTaskAction`**, **`setTaskStatusAction`**, `deleteTaskAction`.
- La fiche contact (`contacts/[id]`) est adaptée : création avec `category = CRM` + `contactId`
  pré-rempli ; la coche utilise `setTaskStatusAction` (→ `DONE`).

## 4. Page `/taches` — kanban (nav, groupe « Relation client »)

- Réutilise le pattern de `components/crm/pipeline-board.tsx` : **4 colonnes** par `TaskStatus`,
  chaque carte a un **`<select>`** qui change de statut au `onChange` (pas de drag → **aucune
  nouvelle dépendance**, mobile-friendly, cohérent avec `/pipeline`).
- **Carte** : titre, badge catégorie (couleur DA), priorité, échéance (rouge si dépassée),
  nom du contact si lié.
- **Filtres** : par catégorie + onglet « Du jour » (dueAt = aujourd'hui).
- **Drawer** création/édition : titre, catégorie, statut, priorité, échéance, description,
  contact optionnel.
- Nouvelle entrée nav `{ href: "/taches", label: "Tâches", icon: …, group: "Relation client" }`.

## 5. Mission Control

- Panneau « Tâches & relances » → **« Tâches du jour »** : `getMissionControlData` filtre
  `dueAt` sur aujourd'hui (toutes catégories), `status != DONE`. Coche rapide
  (`setTaskStatusAction`) + lien « Tout voir » → `/taches`.
- KPI « Tâches en attente » : `status != DONE`.

## 6. Tests (obligatoire — AAA)

- **Vitest** : `createTask`/`updateTask`/`setTaskStatus`/`deleteTask` ; rejets `TaskInput`
  (titre vide, enum invalide) ; filtre « du jour » de `getMissionControlData`.
- **Playwright** : créer une tâche `/taches`, la déplacer de colonne, la cocher depuis Mission Control.

## 7. Docs (clôture, avant push)

`PROGRESS.md`, `TASKS.md`, `docs/patch_notes/patch_note_V0_5.md`,
`docs/technical/API_REFERENCE.md` (nouvelles actions). ARCHITECTURE/SECURITY non impactés
(pas de service/réseau/posture modifiés ; rôle `app_admin` déjà autorisé sur la table).

## Hors-scope (YAGNI)

- Pas de catégories gérables au BO (enum fixe, extensible dans le code).
- Pas de drag & drop natif (select suffit, aligné `/pipeline`).
- Pas de lien générique vers toute entité (contact/deal seulement ; reste en texte libre).
- Pas de récurrence/rappels/notifications.
