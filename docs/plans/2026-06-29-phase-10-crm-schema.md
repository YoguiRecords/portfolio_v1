# Phase 10 — CRM : schéma & socle — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 10 de la roadmap. **Phase à risque** (migration + rôles DB) — relire `STACK_POSTGRES.md` + `STACK_SECURITY.md` avant de commencer.

**Goal :** poser les **modèles CRM** + la **migration sécurisée** (REVOKE pour `app_web`) + les Server Actions CRUD validées Zod. **Pas d'UI** (→ P11).

**Architecture :** Prisma (un seul Postgres, rôles `app_web`/`app_admin`). Le CRM est **données privées admin** : `app_web` n'y accède **jamais** (comme `ContactMessage`). Types partagés dans `packages/core`.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `packages/db/prisma/schema.prisma` (conventions : cuid, timestamps, index, relations) ; **les migrations existantes** qui posent les **GRANT/REVOKE** `app_web`/`app_admin` (chercher `REVOKE`/`GRANT` dans `packages/db/prisma/migrations/**`) ; `lib/auth/guards.ts` (guard de session) ; un service `lib/content/*` + son `*-actions.ts` comme **gabarit** (validation Zod, structure).
- Extraire : le **pattern exact** de migration de droits pour une table privée, et le pattern Server Action + Zod.
- **Sortie :** gabarit migration REVOKE + gabarit action validée à reproduire pour le CRM.

### Task 2 : Modèles Prisma CRM
**Files:** Modify `packages/db/prisma/schema.prisma`
- `Company` (name, website, notes) ; `Contact` (firstName, lastName, email, phone, role, companyId?, source, status, ownerNotes, links vers `Project[]`/`Testimonial?`/`ContactMessage?`) ; enum `DealStage { PROSPECT QUALIFIED PROPOSAL WON LOST }` ; `Deal` (title, contactId, companyId?, valueCents?, stage, probability?, expectedCloseDate?) ; enum `ActivityType { CALL EMAIL MEETING NOTE }` ; `Activity` (type, contactId?, dealId?, content, occurredAt) ; `CrmTask` (title, dueAt, isDone, contactId?, dealId?).
- Index explicites ; relations `onDelete` cohérentes. Commit `feat(db): add CRM models (contacts, companies, deals, activities, tasks)`.

### Task 3 : Migration + droits DB (sécurité)
**Files:** Create migration `packages/db/prisma/migrations/<ts>_crm/migration.sql`
- `prisma migrate dev` pour générer ; **ajouter manuellement** `REVOKE ALL ON <chaque table CRM> FROM app_web;` (+ GRANT à `app_admin`) en suivant le gabarit de Task 1.
- **Test/garde-fou** : un test d'intégration (ou script) vérifie que `app_web` ne peut **pas** lire `Contact`/`Deal`/… Commit `feat(db): CRM migration with app_web REVOKE`.

### Task 4 : Schémas Zod + types `core`
**Files:** Create `packages/core/src/crm/*` (types/schemas) (+ tests)
- Schémas Zod (création/édition contact, deal, activity, task). **TDD** : rejette email invalide / stage inconnu. Commit `feat(core): CRM Zod schemas & types`.

### Task 5 : Server Actions CRUD
**Files:** Create `apps/admin/lib/crm/*` + `apps/admin/lib/actions/crm-actions.ts` (+ tests)
- create/update/delete pour Contact/Company/Deal/Activity/Task ; **guard de session** + **Zod** à la frontière ; mutations CSRF-safe.
- **TDD** : création valide OK ; entrée invalide rejetée ; action sans session refusée. Commit `feat(admin): CRM server actions (CRUD + Zod + guard)`.

### Task 6 : Barrière qualité + PR
- Tests `core` + `admin` verts ; `pnpm --filter @portfolio/db db:generate` OK ; typecheck/lint. **Checklist sécu** : REVOKE vérifié, Zod partout, pas de secret. Docs (`SECURITY.md` + `API_REFERENCE.md`). PR « feat: CRM schema & actions (P10) ».

## Definition of Done
- [ ] Modèles + migration **rejouable** ; `app_web` n'accède pas au CRM (test). Actions CRUD validées Zod + guard. Tests verts. Docs sécu/API. PR.
