# Audit Remediation 2 — Qualité / DRY Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Résorber la dette qualité de l'audit : service de conversion mort, duplication
(`estimateTokens`, boilerplate routes publiques, helpers de formulaires), god file
`content-actions.ts`, validations manuelles hors-norme.

**Architecture:** Consolidation sans changement de comportement : suppression du code mort,
extraction de helpers partagés (core pour le transverse, lib locale pour le spécifique),
scission mécanique des actions par domaine. TDD sur chaque helper extrait.

**Tech Stack:** TypeScript strict, Zod, Vitest, Flask/Pillow (durcissement).

---

### Task 1: Trancher la conversion d'images (P2-3) — garder `image-processor`, supprimer `services/converter`

**Décision** : `image-processor` (Flask) est le service déployé, validé E2E et câblé
(compose, CI, ports admin). `services/converter` (Fastify/sharp) n'est référencé nulle part
→ code mort, on le supprime. (Alternative « basculer sur sharp » consignée dans l'audit §P2-3
si souhaitée plus tard.) En échange, on durcit Flask au niveau du converter supprimé.

**Files:**
- Delete: `services/converter/` (4 fichiers)
- Modify: `services/image-processor/app.py`
- Modify: `services/image-processor/Dockerfile` (déjà modifié non-commité : `ENV HOME=/app` — l'adopter)

**Step 1: Supprimer le service mort**

```bash
git rm -r services/converter
```

**Step 2: Durcir Flask** (dans `app.py`)

```python
MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10 MB
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
# Anti decompression-bomb : Pillow lève au-delà (défaut ~178 MP, on abaisse).
Image.MAX_IMAGE_PIXELS = 40_000_000
```

Et remplacer `return jsonify({'error': str(e)}), 500` par un message générique
(`'conversion failed'`) + `app.logger.exception(...)` (le détail reste dans les logs).

**Step 3: Rebuild + vérifier le pipeline réel**

Run: `docker compose build image-processor && docker compose up -d image-processor`
Puis upload d'une image via le BO (MCP Playwright, page Médias) → l'asset webp apparaît.
Contrôle bomb : `curl -F "file=@<png 12MB>" http://localhost:…` impossible (port interne) →
vérifier à la place via les tests unitaires admin du pipeline (mocks) + healthcheck vert.

**Step 4: Commit**

```bash
git add -A services/ && git commit -m "refactor(converter): drop dead sharp service, harden image-processor (size cap, bomb guard, generic errors)"
```

---

### Task 2: `estimateTokens` unique dans core (P2-5)

**Files:**
- Modify: `packages/core/src/ai/budget.ts` + `budget.test.ts`, `packages/core/src/index.ts`
- Modify: `apps/web/app/api/chat/route.ts`, `apps/admin/lib/actions/ai-actions.ts`

**Step 1: Test (failing)** — `estimateTokens("abcd") === 1`, `estimateTokens("abcd", 2) === 2`,
`estimateTokens("") === 0`.

**Step 2: Implémentation**

```ts
/** Rough token estimate (≈ 4 chars/token). `factor` adds a safety margin. */
export function estimateTokens(text: string, factor = 1): number {
  return Math.ceil((text.length * factor) / 4);
}
```

**Step 3: Substituer** les deux copies locales (`ai-actions.ts` garde sa marge via
`estimateTokens(text, 2)` — comportement inchangé).

**Step 4: Gate + commit** — `pnpm --filter @portfolio/core test && pnpm --filter web test && pnpm --filter admin test`
puis `git commit -m "refactor(core): single estimateTokens shared by chat route and BO assist"`.

---

### Task 3: Boilerplate des routes publiques web (P2-6a)

**Files:**
- Create: `apps/web/lib/http/public-request.ts` + `public-request.test.ts`
- Modify: les 6 routes `apps/web/app/api/*`

**Step 1: Tests (failing)** pour `readJsonBody` (JSON invalide → null) et `isHoneypotHit`
(champ `website` non vide → true).

**Step 2: Implémentation**

```ts
export async function readJsonBody(request: Request): Promise<unknown | null> { … }
export function isHoneypotHit(body: unknown): boolean { … }
```

(L'IP vient du helper core de la remédiation 1 — `clientIpFromHeaders`.)

**Step 3: Refactorer les 6 routes** (aucun changement de contrat HTTP : mêmes statuts).
Vérifier avec les tests de routes existants + `pnpm --filter web test`.

**Step 4: Commit** — `git commit -m "refactor(web): shared public-route helpers (json body, honeypot)"`.

---

### Task 4: Helpers FormData partagés admin (P2-6b)

**Files:**
- Create: `apps/admin/lib/actions/form-utils.ts` + `form-utils.test.ts`
- Modify: `content-actions.ts`, `cv-actions.ts`, `crm-actions.ts` (supprimer les copies locales)

`str`, `csv`, `lines`, `reqId` — tests AAA sur chaque (valeur, vide, absent), substitution
mécanique, `pnpm --filter admin test && pnpm --filter admin typecheck`, commit
`refactor(admin): shared FormData helpers for server actions`.

---

### Task 5: Scinder `content-actions.ts` par domaine (P2-7)

**Files:**
- Create: `apps/admin/lib/actions/career-actions.ts` (track/milestone/goal),
  `apps/admin/lib/actions/analysis-actions.ts` (analyses)
- Modify: `content-actions.ts` (garde KPI, sections home, skills, FAQ, settings, profil, CV HTML)
- Modify: les imports des pages/composants consommateurs (`parcours`, `analyses`, …)

Déplacement **mécanique** (aucune logique modifiée), `git mv` non applicable (fichiers
multiples) → couper/coller par domaine, mettre à jour les imports (`rtk grep` des symboles),
gate `pnpm --filter admin typecheck && pnpm --filter admin test && pnpm --filter admin lint`,
commit `refactor(admin): split content actions by domain (career, analyses)`.

---

### Task 6: Validations Zod manquantes (P3-6, P3-7)

**Files:**
- Modify: `packages/core/src/ai/chat.ts` (ou nouveau `chat-schema.ts`) + test — schéma `ChatHistory`
- Modify: `apps/web/app/api/chat/route.ts` (remplace `parseHistory` manuel)
- Modify: `apps/admin/lib/actions/ai-actions.ts` — schéma `AiConfigInput` (model slug borné,
  budget entier positif, persona ≤ 4000) + codes d'erreur stables au lieu de `error.message`
- Modify: `apps/admin/lib/actions/content-actions.ts` (`deleteAnalysisAction` : valider le
  type contre `ANALYSIS_TYPES` au lieu du cast)

TDD : schémas testés dans core (payload valide / trop long / rôle inconnu / non-array).
Contrat HTTP inchangé (mêmes 400). Gate complet puis commit
`fix(core,admin,web): zod-validate chat history, AI config and analysis type`.

---

### Task 7: Gate final du plan

Run: `pnpm -r lint && pnpm -r typecheck && pnpm test`
Expected: tout vert. Mettre à jour `docs/technical/API_REFERENCE.md` si une signature a bougé
(aucune ne devrait). Pas de commit dédié si rien à changer.
