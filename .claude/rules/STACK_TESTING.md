# STACK.md — Testing

## Overview
- Unit + Integration + E2E | TypeScript uniquement (Vitest + React Testing Library + Playwright)

## Validation en navigateur réel — NON-NÉGOCIABLE
> Une fonctionnalité **ne peut JAMAIS être déclarée « terminée »** sans avoir été testée
> **réellement, en utilisation normale, dans un navigateur que l'IA pilote** (MCP Playwright).
> Tests unitaires verts + `build` vert **ne suffisent pas** : ils ne détectent pas un serveur dev
> avec un client Prisma périmé, un 500 runtime, un état UI cassé, etc. (cas vécu : `/taches` 500
> alors que unit + build étaient verts).

À chaque livraison d'une fonctionnalité avec UI, **avant** de la dire terminée :
1. **Lancer le parcours réel** dans le navigateur MCP (login dev via `quickLoginAction` si BO) :
   créer / modifier / déplacer / supprimer — le geste réel de l'utilisateur, pas qu'un guard.
2. **Si le serveur dev tourne déjà**, le redémarrer si on a régénéré le client Prisma / changé un
   package partagé (sinon il sert une version périmée en mémoire → faux positifs).
3. **Validation visuelle par screenshots** en **desktop ET mobile** (≈390px) : rendu correct,
   responsive (colonnes qui s'empilent, pas de débordement), DA respectée.
4. **Validation UX** : l'usage doit être **agréable** en mobile **et** desktop — cibles tactiles
   suffisantes, pas de geste impossible au doigt, feedback visuel clair, états vides lisibles,
   rien qui « accroche ». Si une interaction est désagréable sur un support, la corriger ou
   prévoir un fallback adapté à ce support.
5. **Ne revendiquer « terminé » qu'après** ces vérifications, screenshots à l'appui.

Outil de validation visuelle = **MCP Playwright** (jamais un script jetable). Nettoyer les
artefacts (screenshots hors repo ou git-ignorés).

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
