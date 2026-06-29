# Phase 16 — Multi-utilisateurs BO + rôles & permissions (RBAC) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Sujet **sécurité-sensible** (BO public durci). Pré-requis : auth existante (`AdminUser`, sessions opaques, TOTP obligatoire, lockout) déjà en place.

**Goal :** permettre **plusieurs comptes** sur le back office, avec un accès **par module** :
- un **rôle prédéfini** donne un préréglage de modules à la création (ex. *Secrétaire*),
- puis le **propriétaire** peut **ajuster module par module** les accès de chaque utilisateur.
- **Aucune inscription** : seul le propriétaire crée/édite/désactive les comptes.

**Principe n°0 (NON-NÉGOCIABLE) :** la permission est vérifiée **côté serveur** à **deux** niveaux (page **et** Server Action), jamais seulement en masquant la nav. Moindre privilège par défaut. Aucune élévation de privilège possible par l'utilisateur lui-même.

---

## Modèle de permissions (conception)

**Modules BO** (clés de permission, union TS — `BoModule`) :
`dashboard, profile, content, skills, career, analyses, faq, projects, articles, media, agenda, testimonials, messages, appointments, mails, calendar, ai, settings, users`.

**Rôles** (`enum AdminRole`) = **préréglages** (modèle appliqué à la création) **+** étiquette :
| Rôle | Préréglage de modules | Spécial |
|---|---|---|
| `OWNER` | **tous** | seul à accéder à `users` (gestion des comptes) ; bypass implicite |
| `EDITOR` | profile, content, skills, career, analyses, faq, projects, articles, media, agenda, testimonials | — |
| `SECRETARY` | messages, appointments, mails, calendar, agenda | correspondance + planning |
| `VIEWER` *(option)* | lecture seule (cf. extension actions) | — |

**Permissions effectives** = la **liste `permissions` stockée sur l'utilisateur** (initialisée depuis le préréglage du rôle, puis éditable à la main par l'OWNER). Le rôle reste comme **étiquette + préréglage** ; `OWNER` a un accès implicite à tout + au module `users`. → satisfait « rôles prédéfinis **et** réglage manuel ».

**v1 = accès par module** (entrer dans le module = utiliser ses actions). **Extension future documentée** : granularité `read`/`write` par module (non bloquant).

---

### Task 1 : Analyser l'existant
- Lire : `packages/db/prisma/schema.prisma` (`AdminUser`, `Session`, `LoginAttempt`), `apps/admin/lib/auth/{guards,session,actions,dev-login}.ts`, `components/admin-nav/admin-nav.tsx`, toutes les pages `app/(dashboard)/*` et leurs Server Actions.
- Extraire : la liste exhaustive **page → module** et **action → module** (table de correspondance), le fonctionnement de `requireEnrolledSession()` et de la session (`session.adminUser`).
- **Sortie :** mapping `route/action → BoModule` complet (sert de référence aux Tasks 4–5).

### Task 2 : Schéma & migration (RBAC)
**Files:** Modify `packages/db/prisma/schema.prisma` ; migration non-interactive (`migrate diff … --script` → `migrate deploy` sur `public` **et** schéma `test`).
- `AdminUser` + `role AdminRole @default(OWNER)`, `permissions String[] @default([])`, `isActive Boolean @default(true)`, `displayName String?`, `mustChangePassword Boolean @default(false)`, `createdById String?` (auto-relation).
- `enum AdminRole { OWNER EDITOR SECRETARY VIEWER }`.
- (Option) table `AdminAudit` (qui/quoi/quand) pour tracer les actions de gestion de comptes.
- **Backfill** : l'admin existant → `role=OWNER`, `isActive=true`, `permissions = TOUS les modules` (script de migration data, idempotent).
- **TDD** : test `db` — l'admin seedé a `role OWNER` + toutes permissions. Commit `feat(db): AdminUser roles & per-module permissions (RBAC)`.

### Task 3 : Cœur permissions (core, pur, testé)
**Files:** Create `packages/core/src/auth/permissions.ts` (+ `permissions.test.ts`)
- `BO_MODULES` (liste), `type BoModule`, `ROLE_PRESETS: Record<AdminRole, BoModule[]>`.
- `effectivePermissions(user)` → `Set<BoModule>` (OWNER ⇒ tous).
- `can(user, module)` → boolean. `presetFor(role)` → `BoModule[]`.
- **Pas d'argon2 ici** (cf. sous-chemin core déjà en place) → exposer via `@portfolio/core/auth` (sous-chemin, importable côté client pour la nav).
- **TDD** : OWNER peut tout ; SECRETARY peut `messages` mais pas `settings`/`users` ; un override manuel ajoute/retire un module. Commit `feat(core): RBAC permission model + role presets`.

### Task 4 : Garde serveur `requirePermission` (défense en profondeur)
**Files:** Modify `apps/admin/lib/auth/guards.ts` ; Create `app/(dashboard)/403/page.tsx`
- `requirePermission(module: BoModule)` : `requireEnrolledSession()` → vérifie `isActive` → vérifie `can(adminUser, module)` sinon `redirect("/403")`.
- `requireOwner()` : raccourci pour le module `users`.
- **TDD** (intégration légère/mock session) : un user sans le module → redirige ; avec → passe. Commit `feat(admin): requirePermission server guard`.

### Task 5 : Appliquer la garde partout (pages **et** actions)
**Files:** Modify chaque `app/(dashboard)/<module>/page.tsx` **et** chaque Server Action (`lib/actions/*`, `lib/auth/dev-login` exclu) selon le mapping Task 1.
- Chaque page protégée : `await requirePermission("<module>")` en tête.
- Chaque Server Action : `await requirePermission("<module>")` (remplace/complète `requireEnrolledSession()`), car une action est **appelable directement** → la nav ne protège rien.
- `admin-nav.tsx` : filtrer les entrées selon `effectivePermissions(session.adminUser)` (UX). Passer les permissions via le layout `(dashboard)`.
- **TDD** : pour 2–3 modules représentatifs, l'action rejette un user non autorisé. Commit `feat(admin): enforce per-module permissions on pages and actions`.

### Task 6 : Gestion des comptes (OWNER only)
**Files:** Create `app/(dashboard)/utilisateurs/page.tsx` + `components/users/*` + `lib/users/manage.ts` (+ test) + `lib/actions/user-actions.ts`
- Page **OWNER-only** (`requirePermission("users")`).
- **Lister** les comptes (email, displayName, rôle, actif, dernière connexion).
- **Créer** : email + displayName + **rôle** (préremplit `permissions` depuis le préréglage) + **mot de passe temporaire** (saisi ou généré, **affiché une seule fois**), `mustChangePassword=true`, **hash argon2id**. → TOTP enrôlé au **premier login** (flux existant `/security/totp`).
- **Éditer les permissions** : cases à cocher par module (la liste effective). **Changer le rôle** réapplique le préréglage (avec confirmation).
- **Activer/désactiver**, **reset mot de passe** (regénère un temporaire + `mustChangePassword`), **supprimer**.
- **Garde-fous (sécurité)** : interdit de **désactiver/supprimer/rétrograder le dernier OWNER** ; interdit de **retirer son propre accès `users`** ; un non-OWNER ne voit jamais cette page (page **+** actions vérifient `users`). **Audit** chaque opération.
- **Validation Zod** de toutes les entrées (email, rôle ∈ enum, permissions ⊆ `BO_MODULES`).
- **TDD** : create depuis préréglage SECRETARY → permissions attendues ; impossible de supprimer le dernier OWNER ; toggle d'un module persiste. Commit `feat(admin): user management (create, permissions, activate, reset) — owner only`.

### Task 7 : Login durci multi-comptes
**Files:** Modify `lib/auth/actions.ts` (login), `app/(dashboard)/layout.tsx`, flux mot de passe
- Login : rejeter un compte **inactif** (message **générique**, pas d'énumération). Conserver lockout/rate-limit par compte.
- `mustChangePassword=true` → forcer le changement avant tout accès (page dédiée). 
- `dev-login` (Task pré-existante) : ne s'applique qu'en dev, **OWNER** uniquement (inchangé sinon).
- **TDD** : compte inactif → login refusé (générique) ; `mustChangePassword` → redirigé vers le changement. Commit `feat(admin): inactive accounts + forced password change`.

### Task 8 : Barrière qualité + docs + PR
- **Tous** les tests verts (`pnpm test`), typecheck/lint/build, **CI verte**.
- **Checklist sécurité** : (1) chaque action protégée serveur-side ; (2) impossible d'escalader ses propres droits ; (3) dernier OWNER inviolable ; (4) comptes inactifs bloqués ; (5) mots de passe argon2id, temporaires affichés une fois ; (6) MFA obligatoire pour **tous** ; (7) aucune route d'inscription publique.
- **Docs** : `SECURITY.md` (modèle RBAC, enforcement), `API_REFERENCE.md` (user-actions + `requirePermission`), `ARCHITECTURE.md` (rôles), `INTEGRATIONS.md` inchangé. `PROGRESS.md`/`TASKS.md`/patch note.
- **PR `llm → dev`** : « feat(admin): multi-utilisateurs BO + RBAC (P16) ».

## Definition of Done
- [ ] L'OWNER crée une **Secrétaire** avec un préréglage, puis **ajuste ses modules** à la main.
- [ ] La secrétaire ne voit/atteint **que** ses modules — vérifié **au niveau page ET action** (accès direct à une action non autorisée **refusé**).
- [ ] **Aucune inscription** ; comptes créés/édités/désactivés **uniquement** par l'OWNER ; dernier OWNER inviolable.
- [ ] Tests verts, docs à jour, PR ouverte.

## Hors périmètre (extensions futures, documentées)
- Granularité **read/write** par module (v1 = accès module).
- Notifications email d'invitation (dépend de Microsoft Graph, P-mail) au lieu du mot de passe temporaire affiché.
- Journal d'audit consultable dans le BO (la table peut être posée en Task 2).
