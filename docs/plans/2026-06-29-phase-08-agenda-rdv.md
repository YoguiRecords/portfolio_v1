# Phase 8 — Agenda / Events + Demandes de RDV — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 8 de la roadmap. Pré-requis : **P1 mergée**.

**Goal :** agenda éditorial conforme **et** traitement des demandes de RDV (`AppointmentRequest`) — geste **accepter / refuser** (≠ boîte de réception). À l'acceptation → **création d'un évènement de calendrier** + réponse au demandeur ; lien vers le contact CRM (par email, branché en P11).

**Architecture :** réécriture présentationnelle ; logique `event.ts` / `event-actions.ts` et `*-calendar.ts` **inchangée** ; ajout de la transition RDV→event via `composite-calendar`.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/agenda/page.tsx`, `lib/content/event.ts`, `lib/actions/event-actions.ts`, `app/(dashboard)/rdv/page.tsx`, `lib/integrations/{db,composite,graph}-calendar.ts`, modèles `Event` / `AppointmentRequest`.
- Extraire : champs Event, statuts RDV (PENDING/CONFIRMED/DECLINED/CANCELLED), API de création d'évènement calendrier.
- **Sortie :** point d'entrée pour « accepter un RDV → créer un event ».

### Task 2 : Agenda (liste + éditeur)
**Files:** Modify `app/(dashboard)/agenda/page.tsx` (+ test)
- Liste + éditeur Event (dates, lieu/online, inscription, visibilité, **programmation** SCHEDULED) + galerie média ; génération d'actu (`ArticleFromEvent`). Commit `feat(admin): agenda/events v2`.

### Task 3 : Demandes de RDV (accepter / refuser)
**Files:** Modify `app/(dashboard)/rdv/page.tsx` (+ test)
- File des `AppointmentRequest` ; actions **Accepter** / **Refuser** (confirmation) ; au refus → statut DECLINED + (option) réponse.
- **TDD** : « Accepter » appelle l'action de confirmation (mockée). Commit `feat(admin): RDV requests accept/decline`.

### Task 4 : Transition RDV accepté → évènement calendrier
**Files:** Modify `lib/actions/...` (action RDV) ou `lib/integrations/composite-calendar.ts` (+ test)
- À l'acceptation : créer un évènement (Graph/DB via `composite-calendar`) avec le créneau demandé ; lier au demandeur.
- **TDD** : accepter un RDV crée un évènement (calendrier mocké) et passe le statut à CONFIRMED. Commit `feat(admin): confirmed RDV creates calendar event`.

### Task 5 : Barrière qualité + PR
- `event.test.ts`, `db-calendar.test.ts`, `composite-calendar.test.ts` (existants) + nouveaux verts ; typecheck/lint. Docs. PR « feat(admin): agenda + RDV v2 (P8) ».

## Definition of Done
- [ ] Agenda CRUD conforme. RDV **accepter/refuser** ; acceptation → évènement calendrier. RDV **hors** boîte de réception. Tests verts. Docs + PR.
