# Phase 17 — Chatbot public IA (rendre fonctionnel) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase **ajoutée** à la roadmap BO v2 (`docs/plans/2026-06-29-bo-v2-roadmap.md`) à la demande de Yohan. Tests = LLM **mocké** (jamais d'appel réseau/coût en test).

**Goal :** rendre **fonctionnel** le chatbot public déjà présent (`apps/web`) — aujourd'hui inopérant. Il doit :
1. **Répondre où sera Yohan** (« quel est ton prochain évènement / où seras-tu ? ») à partir de l'**agenda** (évènements publics à venir).
2. **Répondre sur le contenu du site** (profil, projets, articles, compétences) — données **publiques** uniquement.
3. Rester **on-brand** (garde-fous : toujours promouvoir Yohan, jamais un concurrent) et pouvoir **proposer un RDV** (tool → `AppointmentRequest` PENDING, confirmé au BO).

**Constat (pourquoi ça ne marche pas aujourd'hui) — à confirmer en Task 1 :**
- L'endpoint `POST /api/chat` renvoie **404 « disabled »** tant que `AiAssistantConfig.isPublicChatEnabled` est **faux** (désactivé par défaut). La clé `.env` ne suffit pas → il faut **activer** le chat.
- Les **évènements** injectés dans le contexte ne sont **ni filtrés sur le futur ni triés** (`route.ts` : pas de `where startAt>=now`, pas d'`orderBy`/`take`) → réponse « prochain évènement » peu fiable.
- L'**outil de réservation** (`apps/web/lib/chat/booking.ts`) existe mais **n'est pas câblé** : `runChat` n'envoie pas `tools` et ne traite pas les `toolCalls`.
- Le **widget** (`apps/web/components/chat-widget/*`) est peut-être **non monté** dans le layout public.
- Vérifier que `createOpenRouterLlm` appelle réellement l'API (modèle **`openrouter/fusion`**, défaut déjà en place) et supporte le function-calling.

**Architecture :** inchangée — contexte = données **publiques** de la DB injectées dans un **system prompt à garde-fous** (serveur, non override par l'utilisateur ; corpus petit → pas de vecteurs). Port `Llm` (`packages/core/src/ai/llm.ts`) → adaptateur **OpenRouter** (`createOpenRouterLlm`). Sécurité publique : `isPublicChatEnabled`, rate-limit IP (déjà `12 / 10 min`), Zod, **données publiques only**, jamais la clé côté client.

**Modèle :** **`openrouter/fusion`** (choisi par Yohan — déjà le défaut de `buildChatLlm`). Configurable via `AiAssistantConfig.model`.

**Tech Stack :** Next.js 16 (Route Handler `web`), OpenRouter (port `Llm`), Prisma, Zod, rate-limit (`@portfolio/core`), Vitest (LLM mocké), Playwright.

---

### Task 1 : Audit de l'existant (lecture)
- Lire : `apps/web/app/api/chat/route.ts`, `apps/web/lib/chat/{run,llm,booking}.ts`, `packages/core/src/ai/{llm,chat-context,guardrails}.ts` (noms réels à confirmer), `createOpenRouterLlm` (adaptateur OpenRouter dans `@portfolio/core`), `apps/web/components/chat-widget/*`, et le **layout public** (`apps/web/app/layout.tsx`) pour voir si le widget est monté.
- Vérifier : valeur par défaut de `AiAssistantConfig.isPublicChatEnabled`, schéma `AppointmentRequest` (champ `source`, enum incluant `CHATBOT`), grants `app_web` (lecture publique).
- **Sortie :** liste précise des manques (activation, events futurs, câblage tool, montage widget, adaptateur).

### Task 2 : Activation + configuration
**Files:** `apps/admin` (réglages — relié à P14 si déjà fait) ou action dédiée ; sinon valeur par défaut sûre.
- Permettre d'**activer** le chat (`isPublicChatEnabled = true`) **depuis le BO** (toggle dans Réglages, voir P14) — pas en dur. Modèle par défaut `openrouter/fusion`.
- **TDD** : action met à jour le flag (Zod). **Commit** `feat(admin): toggle public chatbot in settings`.

### Task 3 : Contexte « prochain évènement » fiable
**Files:** `apps/web/app/api/chat/route.ts` ; `packages/core` (builder de contexte) (+ tests).
- Requête events = **à venir uniquement**, triés : `where: { status: "PUBLISHED", visibility: "PUBLIC", startAt: { gte: now } }, orderBy: { startAt: "asc" }, take: 5`.
- Le builder de contexte formate les dates (FR) et marque le **prochain** évènement clairement (« Prochain évènement : … le … à … »).
- **TDD** : le contexte contient l'évènement futur le plus proche et **exclut** les évènements passés ; pas de PII. **Commit** `feat(ai): upcoming-events context for chatbot`.

### Task 4 : Adaptateur OpenRouter vérifié (function-calling)
**Files:** `packages/core` (`createOpenRouterLlm`) (+ test avec `fetch` mocké).
- S'assurer que l'adaptateur envoie `system` + `messages` (+ `tools` si fournis) au format OpenRouter, lit `content` **et** `tool_calls` → mappe vers `LlmResult` (`content`, `toolCalls[]`). Tolérant aux erreurs (jamais de crash public).
- **TDD** (fetch mocké) : une réponse texte → `content` ; une réponse avec `tool_calls` → `toolCalls`. **Commit** `feat(ai): openrouter adapter tool-call mapping`.

### Task 5 : Câblage de l'outil RDV (function-calling)
**Files:** `apps/web/lib/chat/run.ts`, `apps/web/lib/chat/booking.ts`, `route.ts` (+ tests).
- `runChat` envoie la **définition** du tool `book_appointment` au LLM ; si le résultat contient un `toolCall` valide → exécuter le handler (`AppointmentRequest` `source=CHATBOT`, `status=PENDING`, Zod sur args) → renvoyer une confirmation à l'utilisateur. Boucle d'un tour (pas de multi-tour complexe — YAGNI).
- **TDD** (LLM mocké renvoyant un tool-call) : crée la demande ; args invalides rejetés ; sans tool-call → réponse texte normale. **Commit** `feat(web): wire chatbot booking tool`.

### Task 6 : Montage du widget sur le site public
**Files:** `apps/web/app/layout.tsx` (ou layout pertinent), `apps/web/components/chat-widget/*`.
- Monter le widget **uniquement si le chat est activé** (lecture serveur de `isPublicChatEnabled` → prop) pour ne pas afficher une bulle morte. Reskin DA si nécessaire (tokens). A11y + `prefers-reduced-motion`.
- **TDD** (RTL) : envoi d'un message affiche la réponse mockée ; widget masqué si désactivé. **Commit** `feat(web): mount public chat widget when enabled`.

### Task 7 : Barrière qualité + E2E + PR
- `pnpm --filter web test` + `pnpm --filter admin test` + `tsc --noEmit` + `lint` verts.
- **E2E** (`e2e/chatbot.spec.ts`, LLM mocké/intercepté) : poser « quel est ton prochain évènement ? » → réponse affichée ; « je connais quelqu'un pour un site ? » → met **Yohan** en avant ; demande de RDV → « demande envoyée » + `AppointmentRequest` créé.
- Docs : `PROGRESS.md`, `TASKS.md`, `docs/technical/{ARCHITECTURE,SECURITY,API_REFERENCE}.md` (endpoint chat + flux IA + posture). Patch note.

## Definition of Done (P17)
- [ ] Chatbot **activable au BO** ; une fois activé + clé `.env` présente, il **répond réellement**.
- [ ] Répond correctement « **prochain évènement / où seras-tu** » (events publics à venir, triés).
- [ ] Répond sur **profil/projets/articles/compétences** (données publiques only).
- [ ] Garde-fous (promouvoir Yohan, jamais un concurrent) ; **RDV** via tool → `AppointmentRequest` PENDING.
- [ ] Rate-limit + Zod + aucune PII exposée ; clé jamais côté client.
- [ ] Tests (LLM mocké) + E2E verts ; docs à jour ; PR (intégrée à la PR cumulative #9).

## Sécurité (rappel — NON-NÉGOCIABLE)
- Données **publiques uniquement** dans le contexte (jamais email/IP/texte original de PII).
- Clé OpenRouter **server-only** (`.env`), jamais loggée, jamais renvoyée au client.
- System prompt **séparé** du message utilisateur (anti-injection) ; le contenu récupéré est traité comme **donnée**, pas comme instruction.
- Endpoint public : rate-limit + désactivable au BO + validation Zod stricte.
