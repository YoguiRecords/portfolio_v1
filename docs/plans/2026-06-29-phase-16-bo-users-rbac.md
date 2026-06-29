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
| `VIEWER` | **tous les modules en lecture seule** + **données perso masquées** | mode démo/recruteur (cf. Task 5b) |

**Permissions effectives** = la **liste `permissions` stockée sur l'utilisateur** (initialisée depuis le préréglage du rôle, puis éditable à la main par l'OWNER). Le rôle reste comme **étiquette + préréglage** ; `OWNER` a un accès implicite à tout + au module `users`. → satisfait « rôles prédéfinis **et** réglage manuel ».

**UI d'attribution (Task 6)** : une **liste de cases à cocher** des modules existants (`BO_MODULES`) ; l'OWNER **ajoute/retire** un accès. Le rôle préremplit la liste ; l'OWNER l'ajuste ensuite.

**v1 = accès par module** (accès oui/non). `VIEWER` est le **seul** cas read-only de v1 (verrou d'écriture global, cf. Task 5b). **Extension future documentée** : granularité `read`/`write` configurable **par module** (non bloquant).

---

### Task 1 : Analyser l'existant
- Lire : `packages/db/prisma/schema.prisma` (`AdminUser`, `Session`, `LoginAttempt`), `apps/admin/lib/auth/{guards,session,actions,dev-login}.ts`, `components/admin-nav/admin-nav.tsx`, toutes les pages `app/(dashboard)/*` et leurs Server Actions.
- Extraire : la liste exhaustive **page → module** et **action → module** (table de correspondance), le fonctionnement de `requireEnrolledSession()` et de la session (`session.adminUser`).
- **Sortie :** mapping `route/action → BoModule` complet (sert de référence aux Tasks 4–5).

### Task 2 : Schéma & migration (RBAC)
**Files:** Modify `packages/db/prisma/schema.prisma` ; migration non-interactive (`migrate diff … --script` → `migrate deploy` sur `public` **et** schéma `test`).
- `AdminUser` + `role AdminRole @default(OWNER)`, `permissions String[] @default([])`, `isActive Boolean @default(true)`, `displayName String?`, `createdById String?` (auto-relation). **`passwordHash` devient nullable** (compte invité sans mot de passe tant que l'invitation n'est pas honorée).
- `enum AdminRole { OWNER EDITOR SECRETARY VIEWER }`.
- **`AdminInvite`** : `id`, `email`, `adminUserId`, `tokenHash` (SHA-256, **jamais le token en clair**), `expiresAt` (ex. 72 h), `usedAt DateTime?`, `createdById`. Single-use, expirable, révocable.
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

### Task 5b : Mode lecture seule + masquage PII (rôle VIEWER)
**Files:** Create `lib/auth/read-only.ts` + `lib/privacy/mask.ts` (+ tests) ; Modify pages/loaders sensibles
- **Verrou d'écriture** : un helper `assertCanWrite(session)` appelé par **toutes** les Server Actions de mutation → un VIEWER (read-only) est **rejeté** même s'il a le module (défense en profondeur, en plus du masquage UI des boutons).
- **Masquage des données perso** pour VIEWER : `maskPii(value, session)` appliqué avant affichage. **Liste par défaut v1** (ajustable plus tard) :
  - **Emails** : `ContactMessage.email`, `AppointmentRequest.email`, expéditeur des mails (`fromAddress`), `Profile.email`, `SiteSettings.contactEmail` → `j••••@•••.com`.
  - **Réseau / device** : `ip`, `userAgent` (messages & RDV) → masqués entièrement.
  - **Téléphones** (si présents dans le texte) → masqués par regex.
  - **Corps des messages/mails** : masqués (`••• contenu masqué en mode démo •••`) car susceptibles de contenir de la PII.
  - **Secrets** (clé IA, tokens) : déjà jamais affichés — confirmé.
- **TDD** : une mutation par un VIEWER est refusée ; `maskPii` masque un email pour VIEWER et le laisse intact pour OWNER. Commit `feat(admin): read-only mode + PII masking for the VIEWER role`.
- ℹ️ La **liste définitive** sera affinée plus tard (« on les relèvera ») — la liste ci-dessus est le défaut de départ.

### Task 6 : Gestion des comptes (OWNER only)
**Files:** Create `app/(dashboard)/utilisateurs/page.tsx` + `components/users/*` + `lib/users/manage.ts` (+ test) + `lib/actions/user-actions.ts`
- Page **OWNER-only** (`requirePermission("users")`).
- **Lister** les comptes (email, displayName, rôle, actif, dernière connexion).
- **Créer = inviter** : email + displayName + **rôle** (préremplit `permissions` depuis le préréglage). **Aucun mot de passe saisi par l'OWNER** → un **email d'invitation** est envoyé (cf. Task 7). Le compte est créé **inactif/sans hash** tant que l'invitation n'est pas honorée.
- **Éditer les permissions** : **cases à cocher par module** (la liste effective). **Changer le rôle** réapplique le préréglage (avec confirmation).
- **Activer/désactiver**, **renvoyer l'invitation / réinitialiser** (regénère un lien d'invitation, invalide l'ancien), **supprimer**.
- **Garde-fous (sécurité)** : interdit de **désactiver/supprimer/rétrograder le dernier OWNER** ; interdit de **retirer son propre accès `users`** ; un non-OWNER ne voit jamais cette page (page **+** actions vérifient `users`). **Audit** chaque opération.
- **Validation Zod** de toutes les entrées (email, rôle ∈ enum, permissions ⊆ `BO_MODULES`).
- **TDD** : create depuis préréglage SECRETARY → permissions attendues ; impossible de supprimer le dernier OWNER ; toggle d'un module persiste. Commit `feat(admin): user management (create, permissions, activate, reset) — owner only`.

### Task 7 : Onboarding par invitation + politique de mot de passe fort
**Files:** Create `lib/auth/invite.ts` (+ test), `lib/auth/password-policy.ts` (+ test), `app/invitation/[token]/page.tsx` + form, `lib/email/invite-email.ts` ; Modify `lib/auth/actions.ts`
- **Envoi d'invitation** : génère un token aléatoire (256 bits), stocke **son hash** (`AdminInvite`), envoie un **email via Microsoft Graph** (réutilise `getMailbox().sendMessage`) avec le lien `…/invitation/<token>`. **Fallback** si Graph non configuré : afficher le lien **copiable** à l'OWNER (dev/avant branchement boîte).
- **Page `/invitation/[token]`** (publique mais **inutile sans token valide** → ce n'est PAS une inscription) : vérifie le token (non expiré, non utilisé) → l'invité **crée son mot de passe** (politique forte) → `passwordHash` (argon2id) posé, `isActive=true`, `usedAt` daté, token consommé → redirigé vers `/security/totp` (**enrôlement TOTP obligatoire**).
- **Politique de mot de passe (recommandations actuelles, NIST 800-63B)** : **≥ 12 caractères** **+ score `zxcvbn` ≥ 3** (rejette suites clavier, substitutions évidentes, dates, prénoms, répétitions). **Autoriser le collage et les passphrases**, **pas** de règles de composition arbitraires ni de rotation forcée. Confirmation (saisir 2×). Validation **côté serveur** (Zod + `zxcvbn`) — la validation client n'est qu'indicative. **Dépendance `zxcvbn` : approuvée par l'OWNER.**
- Login : rejeter un compte **inactif** ou **sans mot de passe** (message **générique**, pas d'énumération) ; lockout/rate-limit par compte conservés. `dev-login` reste **dev + OWNER** uniquement.
- **TDD** : token expiré/déjà utilisé → refusé ; mot de passe trop court/commun → rejeté ; invitation honorée → compte actif + TOTP requis ; compte inactif → login refusé (générique). Commit `feat(admin): invitation onboarding + strong password policy`.

### Task 8 : Barrière qualité + docs + PR
- **Tous** les tests verts (`pnpm test`), typecheck/lint/build, **CI verte**.
- **Checklist sécurité** : (1) chaque action de mutation protégée serveur-side (permission **+** `assertCanWrite`) ; (2) impossible d'escalader ses propres droits ; (3) dernier OWNER inviolable ; (4) comptes inactifs/sans mot de passe bloqués au login ; (5) mots de passe **argon2id**, créés par l'invité, **politique forte** (≥12, anti-courants) ; (6) **MFA obligatoire pour tous** ; (7) **aucune route d'inscription** — l'onboarding exige un **token d'invitation** émis par l'OWNER (hash stocké, single-use, expirable) ; (8) **VIEWER** read-only **+ PII masquée**.
- **Docs** : `SECURITY.md` (modèle RBAC, enforcement), `API_REFERENCE.md` (user-actions + `requirePermission`), `ARCHITECTURE.md` (rôles), `INTEGRATIONS.md` inchangé. `PROGRESS.md`/`TASKS.md`/patch note.
- **PR `llm → dev`** : « feat(admin): multi-utilisateurs BO + RBAC (P16) ».

## Definition of Done
- [ ] L'OWNER **invite une Secrétaire** (rôle prérègle les modules), puis **coche/décoche ses modules** à la main.
- [ ] La secrétaire reçoit un **email d'invitation**, **crée son mot de passe fort**, **enrôle son TOTP**, et ne voit/atteint **que** ses modules — vérifié **page ET action**.
- [ ] Un **VIEWER** voit tout en **lecture seule** avec **données perso masquées** ; toute mutation est refusée.
- [ ] **Aucune inscription** ; création/édition/désactivation **uniquement** par l'OWNER ; **dernier OWNER inviolable**.
- [ ] Tests verts, docs à jour, PR ouverte.

## Hors périmètre (extensions futures, documentées)
- Granularité **read/write configurable par module** (v1 = accès module ; VIEWER = seul read-only global).
- **Score d'entropie `zxcvbn`** (dépendance à valider) en plus de la liste de mots de passe courants.
- Journal d'audit **consultable** dans le BO (la table `AdminAudit` peut être posée en Task 2).
- L'invitation par email **suppose la boîte Microsoft Graph branchée** ; sinon **fallback lien copiable**.

## Décisions actées
1. Masquage PII : **défaut figé** en Task 5b (affinable plus tard). ✅
2. Robustesse mot de passe : **`zxcvbn` (score ≥ 3)** — dépendance **approuvée**. ✅
3. Onboarding : **email d'invitation** + mot de passe créé par l'invité (fallback lien copiable). ✅
4. Rôles : OWNER / EDITOR / SECRETARY / **VIEWER** (read-only + PII masquée). ✅

> **Statut : plan COMPLET et VALIDÉ — NON démarré.** À lancer sur ton feu vert (idéalement après le merge de la PR #8).
