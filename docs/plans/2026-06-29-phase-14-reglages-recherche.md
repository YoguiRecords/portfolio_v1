# Phase 14 — Réglages, SEO/FAQ & recherche ⌘K — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 14 de la roadmap. Pré-requis : **P1 mergée** (la recherche du topbar devient fonctionnelle ici).

**Goal :** écran **Réglages** (édite `SiteSettings`), gestion **FAQ** (`FaqEntry`), config Assistant IA, et **palette ⌘K** globale (recherche projets/articles/contacts + actions rapides).

**Architecture :** nouvelles pages + composant command-palette ; logique de réglages = Server Actions validées Zod.

---

### Task 1 : Analyser le code précédemment développé
- Lire : modèles `SiteSettings`, `FaqEntry`, `AiAssistantConfig` (schema) + tout service existant qui les lit ; `components/admin-layout/topbar.tsx` (P1) pour brancher ⌘K.
- Extraire : champs `SiteSettings` (marque, SEO défaut, OG, footer, contact, AEO/llms.txt, robots, Umami), portée FAQ.
- **Sortie :** liste des champs éditables + entités cherchables.

### Task 2 : Réglages du site
**Files:** Create `app/(dashboard)/reglages/page.tsx` + actions (+ tests)
- Formulaire `SiteSettings` (sections : Identité, SEO/OG, Footer, Contact, Découvrabilité IA/robots, Analytics) ; Server Action + **Zod**. Commit `feat(admin): site settings page`.

### Task 3 : FAQ
**Files:** Create `app/(dashboard)/faq/page.tsx` (ou sous Réglages) + actions (+ test)
- CRUD `FaqEntry` (question/réponse/scope/ordre/visibilité). Commit `feat(admin): FAQ management`.

### Task 4 : Command palette ⌘K
**Files:** Create `components/command-palette/*` (+ test) ; brancher dans `topbar` + raccourci clavier
- Recherche projets/articles/contacts + **actions** (« Nouveau projet », « Aller à l'inbox »…).
- **TDD** : saisir une requête filtre les résultats ; `Enter` déclenche l'action/navigation (mockée). Commit `feat(admin): global ⌘K command palette`.

### Task 5 : Barrière qualité + PR
- Tests verts ; typecheck/lint. **Sécu :** réglages sous guard + Zod. Docs (`API_REFERENCE`). PR « feat(admin): settings + FAQ + ⌘K (P14) ».

## Definition of Done
- [ ] Réglages + FAQ éditables (Zod) ; ⌘K opérationnel (recherche + actions). Tests verts. Docs + PR.
