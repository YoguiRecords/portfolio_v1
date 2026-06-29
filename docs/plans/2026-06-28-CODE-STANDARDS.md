# Standards de code — NON-NÉGOCIABLE (tous les plans web/admin)

> Référencé par chaque plan `P2+`. Toute étape qui viole ces règles n'est pas
> « done ». Complète (ne remplace pas) `.claude/playbooks/*` et `CLAUDE.md`.

## 1. Pages = composition pure
- Un fichier de route (`app/**/page.tsx`, `layout.tsx`) contient **uniquement** :
  (a) le **chargement de données** via un loader (`lib/data/*`), (b) la
  **composition de composants**, (c) `generateMetadata`.
- **Interdit dans une page** : markup métier, logique, état, style inline,
  fetch direct Prisma inline. Si tu écris du JSX « concret » dans une page →
  extrais-le en module.

## 2. Tout élément visuel = module réutilisable
- Chaque élément (nav, footer, hero, section, carte, bloc, badge, bouton,
  pill, timeline, orbit…) est un **composant autonome** :
  `components/<module>/<module>.tsx` + `<module>.module.css` + `<module>.test.tsx`.
- Props **typées** (pas de `any`), composant **présentational pur** (données
  reçues en props ; aucune requête DB dans un composant).
- Réutilisable : un même composant sert sur la home, une fiche projet, le BO si
  pertinent (ex. `StatCard`, `Tag`, `Markdown`, `Gallery`).

## 3. Séparation des responsabilités
| Couche | Où | Rôle |
|---|---|---|
| Présentation | `components/*` | composants purs + CSS Modules |
| Données (lecture) | `apps/web/lib/data/*` | loaders Prisma (`app_web`, `select` sûrs) |
| Validation | `packages/core/*` | schémas **Zod** partagés |
| Écriture | `apps/admin` Server Actions | mutations (`app_admin`) |

## 4. CSS
- **Un `*.module.css` par composant** (ou utilitaires Tailwind v4). Tokens DA
  centralisés (`globals.css`/`@theme`). **Zéro** `<style>` géant, **zéro** style
  inline, **zéro** valeur magique (utiliser les tokens).

## 5. Qualité (rappel)
- SOLID / DRY / KISS / YAGNI. Early returns, nesting ≤ 3, pas de catch
  silencieux, pas de code mort, naming explicite.
- A11y : landmarks, `alt`, focus visibles, `prefers-reduced-motion`.
- Perf : Server Components par défaut, îlots client minimaux, images optimisées.

## 6. Tests (obligatoires, AAA)
- Chaque module → test **RTL** (comportement, pas implémentation).
- Chaque loader/action → test sur la **DB de test isolée** (P0).
- Parcours critiques → **Playwright** E2E. Services externes/LLM **mockés**.

## 7. Arborescence cible
```
apps/web/
  app/                 # routes = composition + generateMetadata
  components/<module>/  # <module>.tsx + .module.css + .test.tsx
  lib/data/            # loaders (lecture)
  lib/seo/             # builders metadata + JSON-LD
apps/admin/
  app/                 # routes BO = composition
  components/<module>/
  lib/auth/            # existant (MFA, guards)
  lib/actions/         # Server Actions (écriture, Zod)
packages/core/         # schemas Zod, types, utils partagés
```

## 8. Sécurité
- Zod à toute frontière. `app_web` lecture (+ INSERT contact/témoignage/RDV),
  `app_admin` écriture. Secrets en `.env` (jamais committés). CSRF sur mutations
  BO, rate-limit + honeypot sur formulaires publics.
