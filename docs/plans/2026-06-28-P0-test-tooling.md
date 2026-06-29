# P0 — Test Tooling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place l'outillage de test partagé du monorepo (Vitest config commune, base de données de test isolée + fixtures, mock LLM, Playwright E2E) pour que tous les plans suivants soient exécutables en TDD.

**Architecture:** Vitest reste le runner unit/intégration (déjà utilisé pour l'auth). On ajoute une config Vitest partagée, une **DB de test** dédiée (schéma Postgres séparé, migrée puis tronquée entre tests), un **factory** de données via Prisma, un **mock LLM** (OpenRouter), et **Playwright** pour l'E2E. Le tout branché en CI.

**Tech Stack:** pnpm workspaces, Vitest, @testing-library/react, Playwright, Prisma 7, Postgres (Docker `portfolio-db-1`, port hôte 5436).

---

## Pré-requis & conventions

- Toutes les commandes se lancent depuis la racine `portfolio_v1/`.
- La DB Docker tourne déjà (`docker compose up -d db`), port hôte **5436**.
- `DATABASE_URL` n'est **pas** dans `.env` : pour le CLI Prisma, l'exporter à la
  volée depuis `.env` (jamais l'imprimer) :
  ```bash
  set -a; . ./.env; set +a
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5436/${POSTGRES_DB}?schema=public"
  ```

### Task 1: Vérifier la base Vitest existante

**Files:** aucun (vérification).

**Step 1:** Lancer les tests d'auth existants.
Run: `pnpm -r test 2>&1 | tail -30` (ou `pnpm --filter @portfolio/core test`).
Expected: les tests `password.test.ts`, `token.test.ts`, `totp.test.ts`, `schema.test.ts`, `throttle-policy.test.ts` passent. Si `test` n'existe pas dans un package, noter le runner réel (probablement `vitest run`).

**Step 2:** Repérer la config Vitest actuelle.
Run: `find . -not -path '*/node_modules/*' \( -name 'vitest.config.*' -o -name 'vitest.workspace.*' \)`
Si vide → la config est implicite (defaults) ; on en ajoute une partagée (Task 2).

---

### Task 2: Config Vitest partagée + scripts

**Files:**
- Create: `vitest.shared.ts` (racine)
- Modify: `package.json` (racine, scripts), chaque `apps/*/package.json` & `packages/*/package.json` (script `test`)

**Step 1:** Créer la config partagée racine.
```ts
// vitest.shared.ts
import { defineConfig } from "vitest/config";

export const sharedTest = defineConfig({
  test: {
    environment: "node",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/e2e/**"],
  },
});
```

**Step 2:** Pour les packages UI (admin/web), une variante jsdom :
```ts
// vitest.web.ts (racine) — pour composants React
import { defineConfig, mergeConfig } from "vitest/config";
import { sharedTest } from "./vitest.shared";

export default mergeConfig(sharedTest, defineConfig({
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
}));
```
```ts
// vitest.setup.ts (racine)
import "@testing-library/jest-dom/vitest";
```

**Step 3:** Ajouter les deps de test manquantes (validation design : OK).
Run: `pnpm add -Dw vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
Expected: ajoutées au `package.json` racine.

**Step 4:** Script racine `test` :
```jsonc
// package.json (racine) > scripts
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5:** Commit.
```bash
git add vitest.shared.ts vitest.web.ts vitest.setup.ts package.json pnpm-lock.yaml
git commit -m "test(tooling): add shared Vitest config and RTL deps"
```

---

### Task 3: Base de données de test isolée

But : ne JAMAIS toucher la DB de dev. On utilise un **schéma Postgres séparé**
`test` (même base `portfolio`), migré via `prisma migrate deploy`, tronqué entre
tests.

**Files:**
- Create: `.env.test` (git-ignoré — vérifier `.gitignore`)
- Create: `packages/db/src/testing/db.ts`
- Create: `packages/db/src/testing/reset.ts`

**Step 1:** Vérifier que `.env.test` est git-ignoré.
Run: `grep -nE '^\.env' .gitignore` → doit matcher `.env*` ou ajouter `.env.test`.

**Step 2:** `.env.test` (contenu, **pas de secret en clair committé** — valeurs dev locales) :
```
DATABASE_URL=postgresql://portfolio:portfolio_dev@localhost:5436/portfolio?schema=test
```
> NB : le password dev provient de `.env`. Ce fichier reste git-ignoré.

**Step 3:** Client de test + reset.
```ts
// packages/db/src/testing/db.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

export function makeTestClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}
```
```ts
// packages/db/src/testing/reset.ts
import type { PrismaClient } from "../../generated/prisma/client";

/** Tronque toutes les tables applicatives (hors _prisma_migrations). */
export async function resetDb(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'test' AND tablename <> '_prisma_migrations'`,
  );
  if (rows.length === 0) return;
  const list = rows.map((r) => `"test"."${r.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}
```

**Step 4:** Script pour préparer la DB de test (déploie les migrations dans le schéma `test`).
```jsonc
// packages/db/package.json > scripts
"db:test:deploy": "dotenv -e ../../.env.test -- prisma migrate deploy"
```
Ajouter `dotenv-cli` : `pnpm add -Dw dotenv-cli`.
Run: `pnpm --filter @portfolio/db db:test:deploy`
Expected: migrations appliquées dans le schéma `test`.

**Step 5:** Commit.
```bash
git add packages/db/src/testing package.json packages/db/package.json pnpm-lock.yaml .gitignore
git commit -m "test(db): isolated test schema, client and reset helper"
```

---

### Task 4: Factory de fixtures

**Files:** Create `packages/db/src/testing/factories.ts`, Test `packages/db/src/testing/factories.test.ts`

**Step 1: Write the failing test**
```ts
// factories.test.ts
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "./db";
import { resetDb } from "./reset";
import { createProfile, createProject } from "./factories";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("createProject persists a published project with defaults", async () => {
  await createProfile(prisma);
  const p = await createProject(prisma, { title: "Demo", slug: "demo" });
  expect(p.status).toBe("PUBLISHED");
  expect(p.slug).toBe("demo");
});
```

**Step 2:** Run: `pnpm --filter @portfolio/db exec dotenv -e ../../.env.test -- vitest run src/testing/factories.test.ts`
Expected: FAIL (factories not implemented).

**Step 3: Implement** (minimal factories with sane defaults).
```ts
// factories.ts
import type { PrismaClient } from "../../generated/prisma/client";

export function createProfile(prisma: PrismaClient, o: Partial<{ fullName: string; email: string }> = {}) {
  return prisma.profile.create({
    data: { fullName: o.fullName ?? "Yohan Debusscher", headline: "Test", bio: "Test", email: o.email ?? "test@example.com" },
  });
}

export function createProject(prisma: PrismaClient, o: { title: string; slug: string } & Partial<{ type: "GAME"|"SOFTWARE"|"WEBSITE"|"BUSINESS" }>) {
  return prisma.project.create({
    data: { title: o.title, slug: o.slug, summary: "s", content: "c", status: "PUBLISHED", type: o.type ?? "SOFTWARE" },
  });
}
```

**Step 4:** Run le test → PASS.

**Step 5:** Commit.
```bash
git add packages/db/src/testing/factories.ts packages/db/src/testing/factories.test.ts
git commit -m "test(db): add fixture factories"
```

---

### Task 5: Mock LLM (OpenRouter)

But : tester la logique IA sans appeler OpenRouter (ni clé, ni coût).

**Files:** Create `packages/core/src/ai/llm.ts` (interface), `packages/core/src/testing/mock-llm.ts`, Test `packages/core/src/testing/mock-llm.test.ts`

**Step 1: Write the failing test**
```ts
import { expect, test } from "vitest";
import { mockLlm } from "./mock-llm";

test("mockLlm returns the queued reply and records the prompt", async () => {
  const llm = mockLlm(["Bonjour, je suis l'assistant de Yohan."]);
  const out = await llm.complete({ system: "sys", messages: [{ role: "user", content: "hi" }] });
  expect(out.content).toContain("Yohan");
  expect(llm.calls).toHaveLength(1);
});
```

**Step 2:** Run → FAIL.

**Step 3: Implement** the LLM port + mock.
```ts
// llm.ts — port abstrait (impl OpenRouter ajoutée en P14/P15)
export interface LlmMessage { role: "system" | "user" | "assistant"; content: string }
export interface LlmRequest { system?: string; messages: LlmMessage[]; tools?: unknown }
export interface LlmResult { content: string; toolCalls?: { name: string; args: unknown }[] }
export interface Llm { complete(req: LlmRequest): Promise<LlmResult> }
```
```ts
// mock-llm.ts
import type { Llm, LlmRequest, LlmResult } from "../ai/llm";
export function mockLlm(replies: (string | LlmResult)[]): Llm & { calls: LlmRequest[] } {
  const calls: LlmRequest[] = []; let i = 0;
  return {
    calls,
    async complete(req) { calls.push(req); const r = replies[i++] ?? ""; return typeof r === "string" ? { content: r } : r; },
  };
}
```

**Step 4:** Run → PASS.

**Step 5:** Commit.
```bash
git add packages/core/src/ai packages/core/src/testing
git commit -m "test(ai): add LLM port and deterministic mock"
```

---

### Task 6: Playwright E2E

**Files:** Create `playwright.config.ts` (racine), `e2e/smoke.spec.ts`, Modify `package.json` scripts.

**Step 1:** Installer Playwright (validation design : OK).
Run: `pnpm add -Dw @playwright/test && pnpm exec playwright install --with-deps chromium`
Expected: chromium installé.

**Step 2:** Config Playwright (lance `web` en preview sur un port dédié).
```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry" },
  webServer: {
    command: "pnpm --filter web dev",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

**Step 3:** Smoke test.
```ts
// e2e/smoke.spec.ts
import { expect, test } from "@playwright/test";
test("la home publique répond", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBeLessThan(400);
});
```

**Step 4:** Scripts.
```jsonc
// package.json (racine) > scripts
"test:e2e": "playwright test"
```

**Step 5:** Run: `pnpm test:e2e` → le smoke peut échouer tant que `web` est vide (page par défaut). Il doit au moins **se lancer** (serveur up, status < 400). Si la page par défaut renvoie 200, PASS.

**Step 6:** Commit.
```bash
git add playwright.config.ts e2e package.json pnpm-lock.yaml
git commit -m "test(e2e): add Playwright config and smoke test"
```

---

### Task 7: CI — ajouter le job E2E

**Files:** Modify `.github/workflows/*.yml` (le workflow `Lint · Typecheck · Test · Build`).

**Step 1:** Lire le workflow actuel.
Run: `ls .github/workflows && sed -n '1,80p' .github/workflows/*.yml`

**Step 2:** Ajouter, après le job test : service Postgres + `db:test:deploy` + `pnpm test:e2e` (chromium). Réutiliser le `lfs: true` au checkout (assets). Garder le scope CI déjà défini (push `llm`/`dev`/`dependabot/**`/tags).

**Step 3:** Commit.
```bash
git add .github/workflows
git commit -m "ci: run unit + e2e tests with a Postgres service"
```

---

## Definition of Done (P0)

- `pnpm test` (Vitest) vert, factories testées sur la DB de test isolée.
- `pnpm test:e2e` lance Playwright (smoke OK).
- Mock LLM disponible pour P14/P15.
- CI exécute unit + e2e.
- Aucun secret committé ; `.env.test` git-ignoré.
