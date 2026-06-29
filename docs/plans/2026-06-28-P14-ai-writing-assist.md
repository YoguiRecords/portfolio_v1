# P14 — IA: rédaction, assistance par champ & traduction (OpenRouter) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`.
> **Dépendance** : clé `OPENROUTER_API_KEY` dans `.env` (jamais committée). Tests = LLM **mocké** (port de P0). Aucune dépense en test.

**Goal:** Brancher l'IA (OpenRouter) au BO : **assistance par champ** (Corriger, Grammaire, Ponctuation, Reformuler, **Idée**), **traduction FR→EN** à la save (P-i18n), et **rédaction d'actu depuis un événement**. Budget & garde-fous.

**Architecture:** Adaptateur OpenRouter implémentant le **port `Llm`** (P0), clé/model en `.env`/`AiAssistantConfig`. Un **service d'assistance** (`assistText(action, text, locale)`) construit le prompt par action. Composant réutilisable `AiAssist` (toolbar sur les champs texte). Plafond de tokens + journalisation. `app_admin` only.

**Tech Stack:** OpenAI SDK (base URL OpenRouter), Prisma 7, Zod, Vitest, Playwright.

---

### Task 1: `AiAssistantConfig` (DB) + migration

**Files:** Modify `schema.prisma` (+ migration).
```prisma
model AiAssistantConfig {
  id                 String   @id @default(cuid())
  model              String   @default("openrouter/fusion") // slug OpenRouter (pas cher), modifiable au BO
  systemPersona      String?  // garde-fous : « toujours mettre Yohan en avant, jamais un concurrent »
  isBoAssistEnabled  Boolean  @default(true)
  isPublicChatEnabled Boolean @default(false)
  monthlyTokenBudget Int      @default(2000000)
  tokensUsedThisMonth Int     @default(0)
  updatedAt          DateTime @updatedAt
}
```
SELECT public OK (pas de secret ; la clé reste en `.env`). **Commit** `feat(db): AI assistant config`.

---

### Task 2: Adaptateur OpenRouter (port Llm)

**Files:** `packages/core/src/ai/openrouter.ts` (+ test avec `fetch` mocké).
`createOpenRouterLlm({ apiKey, model })` → `complete(req)` POST
`https://openrouter.ai/api/v1/chat/completions` (format OpenAI), parse la réponse,
remonte l'usage tokens. **Test** : requête bien formée (Authorization, model,
messages) ; réponse mappée. **Jamais** logguer la clé. **Commit**
`feat(ai): OpenRouter adapter (Llm port)`.

---

### Task 3: Service d'assistance par champ (TDD, mock)

**Files:** `packages/core/src/ai/assist.ts` (+ test).
`assistText(llm, { action, text, locale })`, `action ∈ {correct, grammar,
punctuation, rephrase, idea}`. Un prompt **par action** (ex. *correct* : « corrige
ortho/grammaire/ponctuation, conserve le sens et le markdown, réponds le texte
seul »). **Test** : chaque action passe le bon system prompt au mock ; renvoie la
suggestion. **Commit** `feat(ai): per-field writing assistance service`.

---

### Task 4: Garde-budget (TDD)

**Files:** `packages/core/src/ai/budget.ts` (+ test).
`assertBudget(config, estimatedTokens)` → throw si dépassement ; `recordUsage`.
**Test** : au-delà du budget → refus. **Commit** `feat(ai): token budget guard`.

---

### Task 5: Server Actions BO + composant `AiAssist`

**Files:** `apps/admin/lib/actions/ai.ts` (+ test), `apps/admin/components/ai-assist/*`.
- Action `assist(action, text)` (auth admin → budget → adaptateur réel ; en test :
  injection du mock). 
- `AiAssist` toolbar (boutons Corriger/Grammaire/Ponctuation/Reformuler/Idée) sur
  `TextField`/`LocalizedField` : affiche la suggestion, **Accepter** (remplace) /
  Ignorer. Test RTL : clic « Reformuler » appelle l'action et propose le texte.
**Commit** `feat(admin): AiAssist toolbar on text fields`.

---

### Task 6: Traduction à la save (branche P-i18n)

**Files:** câbler `on-save-translate` (P-i18n Task 5) sur l'adaptateur réel.
Test (mock) déjà couvert en P-i18n ; ici, intégration : la save d'un champ FR
déclenche la traduction EN via l'adaptateur. **Commit** `feat(admin): wire EN auto-translation to OpenRouter`.

---

### Task 7: Rédaction d'actu depuis un événement (IA)

**Files:** étendre `event-to-article` (P12) avec une variante `draftFromEventAI(llm, event)`
(brouillon enrichi). Test (mock). **Commit** `feat(admin): AI article draft from event`.

---

### Task 8: E2E (LLM mocké)

`e2e/admin-ai.spec.ts` (intercept réseau / mode mock) : « Reformuler » sur un champ
propose un texte ; « Régénérer EN » remplit l'EN. **Commit** `test(e2e): BO writing assistance`.

---

## Definition of Done (P14)
- Assistance par champ (5 actions) + traduction auto FR→EN + rédaction depuis event.
- Adaptateur OpenRouter (clé en `.env`), **budget** appliqué, `app_admin` only.
- Tout testé avec LLM **mocké** (zéro coût en CI). Activable dès la clé fournie.
