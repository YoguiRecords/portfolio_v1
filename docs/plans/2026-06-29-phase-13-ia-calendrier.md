# Phase 13 — Assistant IA + Calendrier (reskin) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 13 de la roadmap. Pré-requis : **P1 mergée**.

**Goal :** mettre les pages **Assistant IA** et **Calendrier** (existantes, fonctionnelles) à la DA v2, sans changer leur logique.

**Architecture :** reskin présentationnel ; `lib/ai/assistant.ts` / `ai-actions.ts` et `*-calendar.ts` **inchangés**. Rappel : la clé OpenRouter reste en `.env` (jamais en DB) ; budget tokens via `AiAssistantConfig`.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/ai/page.tsx`, `lib/ai/assistant.ts`, `lib/actions/ai-actions.ts`, `app/(dashboard)/calendrier/page.tsx`, `lib/integrations/composite-calendar.ts`.
- Extraire : surface UI actuelle (chat IA, config), forme des évènements calendrier (Graph + DB).
- **Sortie :** ce qui est purement visuel à refaire.

### Task 2 : Assistant IA conforme
**Files:** Modify `app/(dashboard)/ai/page.tsx` (+ composants)
- Mise à la DA v2 (panneaux, champs, statut budget). Logique inchangée. Commit `feat(admin): AI assistant v2 skin`.

### Task 3 : Calendrier conforme
**Files:** Modify `app/(dashboard)/calendrier/page.tsx` (+ composants)
- Vue calendrier conforme branchée sur `composite-calendar` (Graph + events DB) ; affiche aussi les RDV confirmés (P8). Commit `feat(admin): calendar v2 skin`.

### Task 4 : Barrière qualité + PR
- Tests existants verts ; typecheck/lint. Vérif manuelle. Docs. PR « feat(admin): AI + calendar v2 (P13) ».

## Definition of Done
- [ ] IA + Calendrier à la DA v2, fonctions inchangées, clé en `.env`. Tests verts. Docs + PR.
