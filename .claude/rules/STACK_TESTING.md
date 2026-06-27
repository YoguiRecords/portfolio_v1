# STACK.md — Testing

## Overview
- Unit + Integration + E2E | TypeScript uniquement (Vitest + React Testing Library + Playwright)

## Vitest + React Testing Library (unit / intégration)
- Unit : `{module}.test.ts` | composants : `{Component}.test.tsx`
- AAA pattern obligatoire (Arrange → Act → Assert)
- Tester le **comportement**, pas l'implémentation
- Mock des appels externes via `vi.mock()`
- Run : `pnpm test` (par app : `pnpm --filter web test`)
- Coverage : v8 (cible 80 % services/utils, 100 % logique critique `packages/core`)
- Code exclu : `/* v8 ignore next */` + justification

## Playwright (E2E)
- Fichiers : `{feature}.spec.ts`
- Couvrir les parcours critiques : site public, login back office, upload+conversion image
- Run : `pnpm test:e2e`

## Sécurité (tests dédiés)
- Tester les garde-fous : validation Zod rejette les entrées invalides, upload refuse
  mime/taille hors limites, accès `admin` sans session → 401/redirect.

## Shared rules
- Never use real credentials
- Mock external services
- Each test: one logical assertion
- Reset state between tests
- Failing tests block PRs
