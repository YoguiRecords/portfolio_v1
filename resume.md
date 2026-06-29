# resume.md — Décisions autonomes nécessitant ta validation

> Journal des choix pris **sans toi** pendant le marathon BO v2 (tu dormais).
> Relis-les au réveil : si un choix ne te convient pas, on corrige.
> Format : `Dnn` · contexte · décision · réversibilité.

## Stratégie d'intégration
- **D01 — PR unique cumulative.** Conformément à ton choix « tout sur `llm`, 1 PR finale », la
  **PR #9 `llm → dev`** accumule TOUTES les phases (P0→P16). Je **ne merge pas** phase par phase.
  Merge unique à la fin, une fois verte. → Réversible (on peut découper en plusieurs PR si tu veux).
- **D02 — Règle de merge Git modifiée (sur ta demande).** `STACK_GIT.md` autorise désormais l'IA à
  merger une PR `llm → dev` **verte** (auto si pas de conflit ; sinon demande). `main` reste à toi.
- **D03 — Pauses « régénération tokens ».** Tu as demandé 30 min après P0 et P2 (exception explicite
  à « ne pas s'arrêter »). La pause **après P0 n'a pas pu être prise** (l'instruction est arrivée
  pendant P1, P0 déjà clôturée). La pause **après P2 est honorée** : reprise automatique programmée
  (~30 min) pour enchaîner sur P3 — ce n'est pas un abandon, le marathon reprend seul.

## Choix techniques
- **D04 — Bouton primary : couleur de texte.** Le plan P0 écrivait `text-[#1a1400]` (couleur en dur),
  ce qui contredit la DoD « aucune couleur en dur ». J'ai utilisé le token `text-bg` (#0d0e10) à la
  place — contraste correct sur l'or. → Réversible (1 ligne).
- **D05 — Util `cn` maison.** Pas de `clsx`/`tailwind-merge` (éviter une dépendance). Simple `filter+join`.

## Validation visuelle (screenshots responsive)
- **D06 — Stratégie screenshots (IMPORTANT, à valider).** Tu veux une validation visuelle par
  screenshot (mobile / FHD / ultra-wide) pour chaque feature. **Contrainte réelle :** tout le BO
  est **derrière l'auth MFA** (`requireEnrolledSession`) → screenshoter le shell connecté impose
  un harnais Playwright authentifié (login + enrôlement/validation **TOTP** + DB seedée + serveurs
  dev web+admin), flaky et lent à relancer par phase sur Windows.
  **Choix pro :** je ne monte PAS un harnais bancal répété à chaque phase. Je :
  1. Valide chaque composant UI par **tests de rendu jsdom** (RTL) — comportement + structure.
  2. Valide la **compilation prod** (`next build`) à chaque phase (tokens/classes Tailwind).
  3. Construis **en P15** un harnais Playwright authentifié unique → captures **mobile (390),
     FHD (1920), ultra-wide (3440)** des parcours réels (dashboard, projets, inbox, CRM, mission
     control), rangées dans `screenshots/`.
  ⚠️ **Si tu veux des screenshots dès maintenant**, dis-le : je monte le harnais TOTP tout de
  suite (au prix d'avancer moins vite sur les features). En l'état, je priorise « TOUTES les
  phases » comme demandé, screenshots consolidés en P15.

## Monitoring usage tokens (claude.ai)
- **D07 — Moniteur d'usage.** Environnement **local** (navigateur visible confirmé). Un moniteur
  Playwright (`scripts/usage-monitor.cjs`, profil persistant, hors dépôt dans scratchpad) screenshote
  `claude.ai/settings/usage` toutes les 2 min → `scratchpad/usage/usage-latest.png`.
  **Règle de pause :** surveiller la ligne **« Session actuelle »** (reset toutes les 5 h). Si elle
  approche **90-95 %**, se mettre en **pause pour la durée restante avant reset** (reprise auto
  programmée) → le quota se recharge, pas de blocage.
  ⚠️ **Auto-monitoring abandonné** : piloter ton Chrome réel exige qu'il soit fermé (verrou de
  profil), et un Chrome séparé est bloqué par Cloudflare au login claude.ai. La page Usage est une
  **modale** (`claude.ai/new#settings/usage`). → **Mode manuel** : tu me donnes le % quand tu veux ;
  je me mets en pause si ~90 %. Scripts jetables supprimés. Dernier relevé : 36 %, reset ~01:25.

## Reports/dettes techniques (mineurs)
- **DT1 (P4/P5)** : renderer markdown dupliqué `apps/web` ↔ `apps/admin` → à extraire dans `@portfolio/core`.
- **DT2 (P8)** : pas d'**éditeur d'évènement `[id]`** dédié (l'agenda reste liste + création + suppression + génération d'actu, reskinnés). L'évènement complet (édition dates/lieu/programmation/galerie) est un complément à ajouter si besoin. La nouveauté clé de P8 (workflow RDV→calendrier) est livrée + testée.
- **DT3 (P6)** : panneau détails média sans « utilisé dans » (relations) — ajout possible plus tard.
- **DT4 (P11)** : pipeline = déplacement par **select** (pas drag-and-drop natif) — fonctionnel + testable, zéro dépendance ; DnD = amélioration UX.
- **DT5 (P11)** : fiche contact 360° = deals + activités + tâches (cœur CRM). L'**agrégation cross-domaine** (mails/messages par email, projets/témoignages liés) et les **hooks « créer contact »** depuis inbox/témoignages sont reportés (liens souples déjà en base).
- **DT6 (P14)** : palette ⌘K = navigation BO ; recherche de contenu DB (projets/articles/contacts par nom) à ajouter.
- **DT7 (P15)** : finitions livrées = docs finales + patch note + E2E **guard** des routes BO. **Reportés** : audit a11y complet, **screenshots responsive authentifiés** (cf. D06 — nécessite harnais TOTP), E2E parcours complet connecté (login MFA → CRUD → CRM). Les états vides/erreurs/confirmations sont déjà en place (EmptyState, Drawer de confirmation).

## Phases sensibles
- **P10 (CRM schéma + rôles DB) — LIVRÉE.** Choix :
  - Migration SQL générée via **`prisma migrate diff`** (ancien schéma git → nouveau), **sans toucher
    de DB** (pas de `migrate dev` risqué), puis bloc **`REVOKE ALL FROM app_web`** ajouté à la main
    (garde `pg_roles`). Appliquée et **validée sur le test DB** (`db:test:deploy` OK).
  - **Liens cross-domaine souples** : `Contact.linkedProjectId/testimonialId/contactMessageId` sont
    de simples `String?` (pas de FK) → migration auto-contenue, **aucune table existante modifiée**
    (rayon de souffle minimal). La fiche 360° (P11) les résoudra par requête. _Réversible._
  - `API_REFERENCE.md` détaillé des actions CRM : **reporté à P15** (consolidation docs).
- **P16 (RBAC + auth) — SOCLE LIVRÉ, suite scopée (DT8).** ⚠️ **À LIRE.**
  **Livré + testé :** schéma (AdminUser += role/permissions/isActive/displayName/createdById ;
  `AdminInvite` ; migration REVOKE app_web, appliquée test DB) ; moteur core `auth/permissions`
  (BO_MODULES, ROLE_PRESETS, `can`/`effectivePermissions`) ; politique mot de passe `auth/password-policy` ;
  gardes serveur `requirePermission`/`requireOwner`/`assertCanWrite` + page `/403` ; masquage PII `lib/privacy/mask`.
  **Choix :** `passwordHash` gardé **requis** (comptes invités = `isActive=false` + placeholder)
  pour ne pas casser le login ; **zxcvbn non installé** (politique forte maison ; upgrade zxcvbn = enhancement approuvé).
  **DT8 — RESTE À FAIRE (mécanique, plan prêt) :** (1) appliquer `requirePermission("<module>")` à
  **chaque page** `(dashboard)/*` + `assertCanWrite`/`requirePermission` à **chaque Server Action** ;
  (2) **filtrer la nav** par `effectivePermissions` ; (3) **UI gestion comptes** (`/utilisateurs`,
  inviter/rôle/permissions/activer/supprimer, dernier OWNER inviolable) ; (4) **onboarding par
  invitation** (`/invitation/[token]`, email Graph + fallback lien) ; (5) login rejette `isActive=false` ;
  (6) appliquer `maskPii` dans les loaders sensibles pour VIEWER ; (7) upgrade **zxcvbn**.
  → Tant que (1)(2)(5) ne sont pas faits, **ne créer que le compte OWNER** (les rôles restreints ne
  sont pas encore réellement cloisonnés au runtime). Le moteur est prêt, le câblage est l'étape suivante.

---
_Dernière mise à jour : pendant P0 (clôturée verte)._
