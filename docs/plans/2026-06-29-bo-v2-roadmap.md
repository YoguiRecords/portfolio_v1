# BO v2 — Feuille de route (mise en conformité + Mail + CRM)

> **For Claude:** REQUIRED SUB-SKILL — détailler chaque phase avec `superpowers:writing-plans` **juste avant** son exécution, puis l'implémenter avec `superpowers:executing-plans`. Ce fichier est l'**index maître** : il garantit qu'aucune partie du BO n'est oubliée. Les plans détaillés vivent dans `docs/plans/2026-06-29-phase-NN-*.md`.

**Goal :** aligner tout le back office (`apps/admin`) sur la direction visuelle **v2** validée, centraliser le mail (Microsoft Graph), et ajouter un **CRM complet**, sans régression fonctionnelle ni affaiblissement de la posture sécurité.

**Architecture :** Next.js 16 (App Router) + TypeScript strict + Tailwind v4 + Prisma. On **ne réécrit pas** la logique métier existante (auth, contenus, médias, intégrations) : on remplace la **couche UI** par un design-system partagé, on **unifie** les inbox en vue, et on **ajoute** les modèles + écrans CRM. DB : un seul Postgres, rôles `app_web` (lecture publique) / `app_admin` (R/W) ; tout le nouveau (CRM, inbox) reste **inaccessible à `app_web`**.

**Réf. visuelle :** `mockups/bo/v2/*` (Dashboard, Mission Control, Projets, éditeur + aperçu live, Me concernant) et le design-system `mockups/bo/assets/bo.css` (tokens graphite noir/gris + or).

**Décisions verrouillées :**
1. **Mail** = Microsoft Graph (intégration existante `lib/integrations/graph-*`). Pas d'IMAP/Gmail.
2. **Boîte de réception UNIQUE = Mails + Messages uniquement** (même geste : *répondre ou pas*). Une vue agrège Mails (Graph) + Messages (`ContactMessage`), filtrable par source. **Les RDV (`AppointmentRequest`) sont traités À PART** : geste différent (*accepter / refuser* + impact agenda) → page dédiée (voir P8). Les sources restent distinctes en base.
3. **CRM complet** : Contacts + Sociétés + Deals (pipeline) + Activités/Notes + Tâches/relances.
4. **Tout le BO** est remis en conformité, **découpé en phases** (livraison au fil de l'eau).

---

## État des lieux (ancrage sur l'existant)

**Déjà construit (à RE-SKINNER, pas à recréer) :**

| Domaine | Pages / modules réels |
|---|---|
| Auth durcie (argon2id + TOTP/MFA, sessions opaques, lockout) | `lib/auth/*`, `app/login/*`, `app/security/totp/*` — **intouché** |
| Shell | `components/admin-layout/*`, `components/admin-nav/*`, `app/(dashboard)/layout.tsx` |
| Dashboard | `app/(dashboard)/page.tsx`, `lib/data/dashboard.ts`, `components/dashboard-stats/*` |
| Profil / Me concernant | `app/(dashboard)/profile/*`, `lib/content/profile.ts` |
| Contenu home | `app/(dashboard)/content/page.tsx`, `lib/content/home-section.ts` |
| Projets (+ éditeur blocs) | `app/(dashboard)/projets/{page,[id]/page}.tsx`, `lib/content/project*.ts`, `lib/actions/project-actions.ts`, `components/block-editors/*` |
| Articles | `app/(dashboard)/articles/page.tsx`, `lib/content/article.ts`, `lib/actions/article-actions.ts`, `lib/publishing/*` |
| Médias | `app/(dashboard)/media/page.tsx`, `lib/media/*`, `lib/actions/media-actions.ts` |
| Témoignages | `app/(dashboard)/temoignages/page.tsx`, `lib/content/moderation.ts`, `lib/actions/moderation-actions.ts` |
| Messages (contact) | `app/(dashboard)/messages/page.tsx` |
| RDV | `app/(dashboard)/rdv/page.tsx` |
| Mails (Graph) | `app/(dashboard)/mails/{page,[id]/page}.tsx`, `lib/integrations/graph-mailbox.ts`, `graph-client.ts`, `demo-mailbox.ts`, `lib/actions/mail-actions.ts`, `components/mail-reply-form.tsx` |
| Calendrier | `app/(dashboard)/calendrier/page.tsx`, `lib/integrations/{db,composite,graph}-calendar.ts` |
| Assistant IA | `app/(dashboard)/ai/page.tsx`, `lib/ai/assistant.ts`, `lib/actions/ai-actions.ts` |
| i18n (overlay EN) | `lib/i18n/on-save-translate.ts`, `components/localized-field/*`, modèle `Translation` |

**À CRÉER :** design-system v2, shell rail, aperçu live, boîte de réception unifiée, **CRM (modèles + écrans)**, **Mission Control**.

---

## Règles transverses (s'appliquent à CHAQUE phase — checklist DoD)

- [ ] **Sécurité** : entrées validées **Zod** à la frontière (Server Actions / Route Handlers) ; CSRF sur mutations ; guard de session sur toute route `(dashboard)` ; nouveaux modèles **REVOKE** pour `app_web` ; aucun secret en dur.
- [ ] **Tokens DA** : aucune couleur/spacing en dur dans les composants → uniquement via le thème Tailwind (`@theme`). Pas de `zinc-*`/`amber-*` résiduels.
- [ ] **Tests** : Vitest + RTL pour la logique et les composants à comportement ; Playwright pour les parcours critiques ; cible 80 % services/utils, 100 % logique critique `packages/core`. Un test minimum par feature/bugfix (AAA).
- [ ] **i18n** : tout nouveau champ de contenu éditable passe par l'overlay `Translation` (FR source, EN auto).
- [ ] **A11y** : focus visibles, rôles/aria, contraste AA, navigation clavier (la DA est sombre → vérifier contrastes).
- [ ] **Responsive** : rail → barre de navigation **en bas** sur mobile ; tables → cartes/scroll.
- [ ] **Docs** (avant push) : `PROGRESS.md`, `TASKS.md`, `docs/technical/{ARCHITECTURE,SECURITY,API_REFERENCE}.md` si impactés, patch note `docs/patch_notes/patch_note_VX_Y.md`.
- [ ] **Git** : travail sur `llm`, commits atomiques (Conventional Commits, tests verts après chacun), **1 phase = 1+ PR `llm → dev`**, revue humaine. Jamais de push direct sur `dev`/`main`.

---

## Séquencement (dépendances)

```
P0 Design system ──► P1 Shell ──► P2 Dashboard
                          │
                          ├──► P3 Projets ─┐
                          ├──► P4 Articles ─┤ (aperçu live commun, livré en P3)
                          ├──► P5 Profil/Home/CV ─┘
                          ├──► P6 Médias
                          ├──► P7 Témoignages
                          └──► P8 Agenda
P10 CRM (schéma) ──► P11 CRM (UI) ──┐
P9 Boîte unique ───────────────────┼──► P12 Mission Control
                                   │
P13 IA + Calendrier (reskin)       │
P14 Réglages + recherche ⌘K ───────┘
P15 Finitions transverses (E2E, a11y, perf, docs)
```

P0→P2 d'abord (socle visible). Le CRM (P10/P11) peut démarrer **en parallèle** du reskin contenu car il touche surtout DB + nouvelles pages. Mission Control (P12) vient **après** Mail unifié (P9) + CRM (P11) dont il agrège les données.

---

## Phases

### P0 — Design system & tokens
**Objectif :** fondation visuelle réutilisable, fidèle à `mockups/bo/assets/bo.css`.
**Fichiers :** `apps/admin/app/globals.css` (bloc `@theme` : graphite, or, statuts, radius, ombres) ; nouveau dossier `apps/admin/components/ui/` (primitives).
**Tâches :** tokens Tailwind ; primitives `Button`, `Badge`/`Status`, `Card`/`Panel`, `KpiCard`, `DataTable` (tri/filtre/actions de ligne/sélection), `Field`/`Input`/`Select`/`Textarea`/`Switch`, `Segmented`, `Pagination`, `Drawer`, `EmptyState`, `Avatar`, `Tag`, `Toolbar`, `SaveBar`, `PreviewFrame`.
**Tests :** RTL sur les primitives à logique (DataTable, Switch, Segmented, Pagination). **DoD :** primitives utilisées par P1+, aucune couleur en dur.
→ **Plan détaillé : `docs/plans/2026-06-29-phase-00-design-system.md`**

### P1 — Shell v2 (rail + topbar)
**Objectif :** remplacer la sidebar plate par le **rail à icônes** + topbar.
**Fichiers :** `components/admin-layout/*`, `components/admin-nav/*` (transformer `ADMIN_NAV` en groupes + icônes), `app/(dashboard)/layout.tsx`.
**Tâches :** rail (icônes + tooltips + groupes *Contenu / Relation client / Mesure*) ; topbar (recherche ⌘K placeholder, notif, bouton Créer, avatar, logout) ; **bottom bar mobile** ; états actifs par route ; pastilles de compteur (non-lus, à-valider).
**Tests :** `admin-nav.test.tsx` (route active, groupes) ; rendu responsive. **DoD :** navigation entre toutes les pages OK, mobile compris.

### P2 — Dashboard v2
**Objectif :** dashboard accueillant **et** dense (portfolio & audience), distinct de Mission Control.
**Fichiers :** `app/(dashboard)/page.tsx`, `lib/data/dashboard.ts`, `components/dashboard-stats/*`.
**Tâches :** bandeau greeting ; KPIs (visiteurs Umami, projets, articles, témoignages à valider) ; mini-graphe trafic ; « contenu à traiter » (brouillons / en revue / témoignage en attente) ; top contenus.
**Tests :** agrégations `dashboard.ts` (KPIs, comptes). **DoD :** données réelles, liens vers les bonnes sections.

### P3 — Projets (liste + éditeur + **aperçu live**)
**Objectif :** liste conforme (DataTable CRUD) + éditeur `[id]` (blocs) avec **aperçu live réduit & fermable**.
**Fichiers :** `app/(dashboard)/projets/{page,[id]/page}.tsx`, `components/block-editors/*`, **nouveau** `components/live-preview/*` (composant d'aperçu partagé).
**Tâches :** liste (filtres statut, recherche, actions éditer/aperçu/supprimer + confirmation, pagination) ; éditeur en `editor.with-preview` (toggle 👁 + ✕) ; aperçu = rendu React consommant le state du form ; conserver les blocs flexibles existants.
**Tests :** actions projet (déjà `project.test.ts`) ; comportement toggle/ live-preview ; suppression confirmée. **DoD :** CRUD complet, aperçu live OK.

### P4 — Articles (liste + éditeur + programmation)
**Fichiers :** `app/(dashboard)/articles/page.tsx`, `lib/content/article.ts`, `lib/actions/article-actions.ts`, `lib/publishing/*`.
**Tâches :** liste conforme ; éditeur (markdown + aperçu live, réutilise `live-preview`) ; **publication programmée** (`SCHEDULED` + `scheduledAt`, cron existant) ; tags, catégorie, SEO.
**Tests :** `publish-due.test.ts` (existant) ; programmation. **DoD :** CRUD + programmation conformes.

### P5 — Me concernant + Contenu home + CV
**Fichiers :** `app/(dashboard)/profile/*`, `app/(dashboard)/content/page.tsx`, `lib/content/{profile,home-section}.ts`.
**Tâches :** form « Me concernant » (identité, casquettes, bios, réseaux) + **aperçu live de la section « À propos »** ; édition `HomeSection` (eyebrow/titre/intro/CTA/ordre/visibilité) ; **éditeur CV HTML** (rendu isolé iframe `srcdoc` + CSP, cf. `STACK_SECURITY`).
**Tests :** `profile-form.test.tsx` (existant) à adapter. **DoD :** champs alimentent bien le site public.

### P6 — Médias
**Fichiers :** `app/(dashboard)/media/page.tsx`, `lib/media/*`.
**Tâches :** médiathèque conforme (grille masonry, dropzone, détails : dimensions/poids, EXIF strip, « utilisé dans ») ; pipeline existant (webp + MinIO) inchangé ; support `VIDEO`/`EMBED`.
**Tests :** `media.test.ts` (existant). **DoD :** upload + sélection conformes.

### P7 — Témoignages (modération)
**Fichiers :** `app/(dashboard)/temoignages/page.tsx`, `lib/content/moderation.ts`.
**Tâches :** file de modération conforme (PENDING/APPROVED/REJECTED), champs auteur (prénom/nom/rôle/société/relation), édition du texte affiché vs original, mise en avant, ordre. **Lien CRM** : un auteur peut devenir/être un contact (préparé en P11).
**Tests :** `moderation.test.ts` (existant). **DoD :** approuver/éditer/refuser conformes.

### P8 — Agenda / Events + Demandes de RDV
**Objectif :** agenda éditorial **et** traitement des demandes de RDV (geste *accepter / refuser*, distinct de la boîte de réception).
**Fichiers :** `app/(dashboard)/agenda/page.tsx`, `lib/content/event.ts`, `lib/actions/event-actions.ts` ; `app/(dashboard)/rdv/page.tsx` (reskin), `lib/integrations/{db,composite,graph}-calendar.ts`.
**Tâches (Agenda) :** liste + éditeur (dates, lieu/online, inscription, visibilité, programmation) + galerie média ; génération d'actu depuis un évènement (`ArticleFromEvent`).
**Tâches (RDV) :** file des demandes (`AppointmentRequest` : PENDING/CONFIRMED/DECLINED/CANCELLED) avec actions **Accepter / Refuser** ; à l'acceptation → **création d'un évènement de calendrier** (Graph/DB via `composite-calendar`) + réponse au demandeur ; lien vers le contact CRM (par email). **NB :** les RDV ne sont **pas** dans la boîte de réception (P9).
**Tests :** `event.test.ts`, `db-calendar.test.ts`, `composite-calendar.test.ts` (existants) ; transition accepter→event. **DoD :** CRUD agenda + workflow RDV (accept/refuse→calendrier) conformes.

### P9 — Boîte de réception UNIQUE (Mails + Messages)
**Objectif :** une vue agrège **Mails (Graph) + Messages (`ContactMessage`)** — même geste *répondre ou pas*. **Hors périmètre : RDV** (traités en P8).
**Fichiers :** **nouveau** `app/(dashboard)/inbox/page.tsx` + `app/(dashboard)/inbox/[source]/[id]/page.tsx` ; **nouveau** `lib/inbox/aggregate.ts` (port unifié : normalise `GraphMessage` / `ContactMessage` → `InboxItem`) ; réutilise `lib/integrations/graph-mailbox.ts`, `mail-actions.ts`, `components/mail-reply-form.tsx`. Anciennes pages `mails`/`messages` → absorbées par `inbox` ; `rdv` reste autonome (P8).
**Tâches :** type `InboxItem` (source `MAIL`|`CONTACT`, expéditeur, sujet, date, lu, lien contact) ; filtres `[Tous][✉ Mail][📨 Contact]` ; lecture + marquer lu ; **répondre** (Graph pour les mails ; pour un message formulaire → réponse par email via Graph) ; transformer un expéditeur en contact CRM (hook vers P11).
**Tests :** `aggregate.ts` (fusion + tri + filtres, sources mockées) ; `demo-mailbox.test.ts` (existant). **DoD :** Mails + Messages dans une vue unique, réponse email fonctionnelle, RDV absents (vérifié).

### P10 — CRM : schéma & socle
**Objectif :** modèles + sécurité + actions, sans UI.
**Fichiers :** `packages/db/prisma/schema.prisma` (+ migration), `apps/admin/lib/crm/*`, `apps/admin/lib/actions/crm-actions.ts`, types dans `packages/core`.
**Modèles :** `Contact` (nom, email, tél, rôle, sociétéId, source, statut, ownerNotes), `Company`, `Deal` (titre, contactId, companyId, valeur, stage, probabilité, closeDate), enum `DealStage` (PROSPECT/QUALIFIED/PROPOSAL/WON/LOST), `Activity` (type appel/email/note/meeting, contactId/dealId, date, contenu), `Task`/relance (dueAt, done, contactId/dealId). Liens optionnels vers `Project`, `Testimonial`, `ContactMessage`.
**Sécurité :** migration avec **REVOKE ALL** pour `app_web` sur toutes les tables CRM (comme `ContactMessage`). Zod sur toutes les actions.
**Tests :** actions CRUD + garde-fous (création/édition/suppression), validations Zod (rejet d'entrées invalides). **DoD :** migration rejouable, `app_web` n'y accède pas (test d'accès).
→ Détailler avant exécution (phase à risque : migration + rôles).

### P11 — CRM : UI
**Fichiers :** **nouveaux** `app/(dashboard)/contacts/{page,[id]/page}.tsx`, `app/(dashboard)/societes/page.tsx`, `app/(dashboard)/pipeline/page.tsx`, `components/crm/*`.
**Tâches :** liste Contacts (DataTable, recherche, filtres) ; **fiche contact 360°** (infos + activités + deals + mails/messages liés par email + projets/témoignages associés) ; Sociétés ; **Pipeline** board (colonnes par `DealStage`, glisser-déposer) ; activités/notes ; **tâches/relances** (échéances). Boutons « créer contact/deal » depuis l'inbox (P9) et la modération témoignage (P7).
**Tests :** composants à logique (board move, filtres) + actions. **DoD :** CRUD CRM complet, fiche 360° branchée.

### P12 — Mission Control
**Fichiers :** **nouveau** `app/(dashboard)/mission-control/page.tsx`, `lib/data/mission-control.ts`.
**Tâches :** agrégation « tout ce que je dois traiter » : KPIs relation client (contacts, mails non lus, affaires, délai réponse) ; **pipeline** ; **tâches du jour** (relances CRM + à-valider modération + contenu en revue + RDV à confirmer) ; **inbox preview + compose**. Branché sur P9 + P11 + modération + publishing.
**Tests :** agrégation `mission-control.ts`. **DoD :** une page = pilotage rapide, sans doublon avec le Dashboard.

### P13 — Assistant IA + Calendrier (reskin)
**Fichiers :** `app/(dashboard)/ai/page.tsx`, `app/(dashboard)/calendrier/page.tsx`.
**Tâches :** mise à la DA v2 (existants, fonctionnels). Calendrier : vue conforme branchée sur `composite-calendar` (Graph + events DB). **DoD :** conformes visuellement, fonctions inchangées.

### P14 — Réglages, SEO/FAQ & recherche globale
**Fichiers :** **nouveau** `app/(dashboard)/reglages/page.tsx` (édite `SiteSettings`), gestion `FaqEntry`, config Assistant IA ; **palette ⌘K** globale (recherche projets/articles/contacts/actions).
**Tâches :** réglages site (marque, SEO défaut, OG, footer, contact, AEO/llms.txt, Umami) ; FAQ ; **command palette** (la recherche du topbar devient fonctionnelle). **DoD :** réglages éditables, ⌘K opérationnel.

### P15 — Finitions transverses
**Tâches :** états **vides / erreurs / confirmation de suppression** partout ; audit **a11y** ; **responsive** complet (rail→bottom bar, tables→cartes) ; **Playwright** E2E (login MFA → CRUD projet → modération → inbox → CRM → mission control) ; perf (lazy, pagination serveur) ; **docs finales** (`ARCHITECTURE`/`SECURITY`/`API_REFERENCE`) + **patch note vX.Y.0** + `PROGRESS.md`.
**DoD :** checklist sécu (cf. `STACK_SECURITY`) verte, E2E verts, docs à jour.

### P16 — Multi-users BO + RBAC (SENSIBLE)
**Tâches :** rôles + permissions par module, VIEWER lecture seule + masquage PII, invitations email + politique mot de passe forte (zxcvbn score≥3). Phase à risque auth → détailler/valider avant exécution.
→ **Plan détaillé : `docs/plans/2026-06-29-phase-16-bo-users-rbac.md`**

### P17 — Chatbot public IA (rendre fonctionnel) — AJOUTÉE
**Objectif :** rendre opérationnel le chatbot public existant (`apps/web`) : répondre « prochain évènement / où sera Yohan » (agenda public à venir) + questions sur le contenu (profil/projets/articles), garde-fous (toujours promouvoir Yohan), proposer un RDV (tool → `AppointmentRequest`). Modèle **`openrouter/fusion`**. Activable au BO. Tests LLM mockés.
→ **Plan détaillé : `docs/plans/2026-06-30-phase-17-public-chatbot.md`**

---

## Suivi
- Ce fichier = **backlog maître**. À l'ouverture de chaque phase : créer `docs/plans/2026-06-29-phase-NN-*.md` détaillé (skill `writing-plans`), puis exécuter (skill `executing-plans`).
- Tenir `TASKS.md` (backlog actionnable, retirer ce qui est livré) et `PROGRESS.md` (état courant) — **à créer** (absents aujourd'hui).
- Patch notes par minor dans `docs/patch_notes/`.
