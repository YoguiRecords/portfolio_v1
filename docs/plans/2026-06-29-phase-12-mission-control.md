# Phase 12 — Mission Control — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 12 de la roadmap. Pré-requis : **P9 (inbox) + P11 (CRM) mergées** ; modération (P7) + publishing (P4) dispo.

**Goal :** une page **« tout ce que je dois traiter, vite »** : KPIs relation client, pipeline, tâches du jour (agrégées), inbox preview + compose. Conforme à `mockups/bo/v2/mission-control.html`. **Pas de doublon** avec le Dashboard (qui couvre portfolio/audience).

**Architecture :** service d'agrégation `lib/data/mission-control.ts` qui compose : CRM (P11), inbox (P9), modération (P7), publishing/contenu en revue (P4), RDV à confirmer (P8).

---

### Task 1 : Analyser le code précédemment développé
- Lire : `lib/data/mission-control` sources — `lib/inbox/aggregate.ts`, `lib/crm/*` (deals/tasks), `lib/content/moderation.ts`, `lib/publishing/publish-due.ts`, RDV (P8).
- **Sortie :** liste exhaustive des « à-faire » à agréger et leurs requêtes.

### Task 2 : Service d'agrégation Mission Control
**Files:** Create `lib/data/mission-control.ts` (+ test)
- KPIs (contacts, mails non lus, affaires en cours, délai de réponse) ; `pipeline` (deals par stage) ; `tasksOfDay` = relances CRM échues + témoignages PENDING + contenu en revue + RDV à confirmer ; `inboxPreview`.
- **TDD** : `tasksOfDay` fusionne les sources mockées et trie par priorité/échéance. Commit `feat(admin): mission-control aggregation`.

### Task 3 : Page Mission Control
**Files:** Create `app/(dashboard)/mission-control/page.tsx` + `components/mission-control/*` (+ test)
- KPIs + **pipeline** + **tâches du jour** (actions rapides : valider, répondre, confirmer) + **inbox preview + compose**. Liens profonds vers les écrans concernés. Commit `feat(admin): mission control page`.

### Task 4 : Entrée nav + pastille
**Files:** Modify nav (P1)
- Entrée « Mission Control » avec compteur d'à-faire. Commit `feat(admin): mission control nav entry`.

### Task 5 : Barrière qualité + PR
- Tests verts ; typecheck/lint. Vérifier **absence de doublon** avec Dashboard. Docs. PR « feat(admin): mission control (P12) ».

## Definition of Done
- [ ] Une page agrège inbox + CRM + modération + RDV + contenu en revue, sans doublon Dashboard. Actions rapides OK. Tests verts. Docs + PR.
