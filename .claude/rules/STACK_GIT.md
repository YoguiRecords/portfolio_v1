# STACK.md — Git

## Branches
- **main** — production, **réservée à l'utilisateur** | requires PR + tests passing. **L'IA ne push, ne merge, ni ne tag JAMAIS sur `main`.**
- **dev** — integration branch. Alimentée **uniquement par PR** (jamais de push direct de l'IA).
  L'IA peut **merger** une PR `llm → dev` selon la règle de merge ci-dessous.
- **llm** — branche de travail **dédiée à l'IA (Claude)**, longue durée. C'est la **seule** branche
  sur laquelle l'IA commit et push. Toute intégration se fait via **Pull Request `llm` → `dev`**.
- **feature/{name}**, **fix/{name}**, **refactor/{name}**, **chore/{name}**, **docs/{name}** — branches éphémères humaines si besoin.

Naming: lowercase, hyphens, max 50 chars

## Commits (Conventional Commits)
```
<type>(<scope>): <subject>

<body>
<footer>
```

**Types:** feat | fix | refactor | style | test | docs | chore | perf

**Scopes:** web | admin | db | core | auth | proxy | storage | converter | articles | docker | docs

**Subject:** imperative, no period, max 50 chars

**Body:** explains why (not what), wrapped 72 chars, reference issues (`Closes #123`)

**Example:**
```
feat(kanban): add swimlane drag-and-drop

Implement horizontal drag for task cards across swimlanes.

Closes #234
```

## Workflow IA (Claude) — NON-NÉGOCIABLE
1. Travailler sur **`llm`** (commits atomiques, tests verts après chacun).
2. Resynchroniser régulièrement depuis `dev` : `git merge origin/dev` (éviter la divergence).
3. Push sur `origin/llm`.
4. Ouvrir une **PR `llm` → `dev`** (atomique : une PR = une feature/fix cohérent).
5. **Merger** selon la **Règle de merge PR** ci-dessous.
6. `dev` → `main` et tag `vX.Y.Z` : **réservé à l'utilisateur** (l'IA n'y touche pas).

## Règle de merge PR `llm → dev` (IA)
**Condition unique et obligatoire : la PR doit être VERTE** (tous les checks CI au vert).
- ❌ **PR rouge** → ne PAS merger. Corriger (lint/typecheck/test/build) **jusqu'au vert**, puis merger.
- ✅ **PR verte + aucun conflit** → l'IA **merge automatiquement** (pas besoin d'autorisation).
- ✅ **PR verte + conflit** → l'IA **demande l'autorisation** avant de merger ; autorisation donnée → merge.
- `main` reste **réservée à l'utilisateur** (l'IA n'y merge/tag jamais).

## Workflow humain (branches éphémères, optionnel)
1. Create branch: `git checkout -b feature/name`
2. Atomic commits (tests pass after each)
3. Push → PR → review → merge to dev (delete branch)

## Intégration continue (CI)
- Le workflow CI (`lint · typecheck · test · build`) tourne **uniquement** sur :
  `push` → **`llm`** (branche de travail IA), `push` → **`dev`**, `push` → **`dependabot/**`**,
  et les **tags `v*.*.*`**. Jamais sur les branches `feature/*` ou sur l'évènement `pull_request`.
- **Dependabot** cible **`dev`** (jamais `main`) ; ses branches `dependabot/**` sont CI-validées,
  donc le check requis est satisfait sur le SHA → PR `dependabot/** → dev` mergeable une fois verte.
- Le check tourne sur le **SHA du commit `llm`** ; ce SHA devient le head de la PR `llm → dev`,
  donc la PR est déjà verte au moment de l'ouverture.
- **`dev` est protégée** (GitHub branch protection) : le check `Lint · Typecheck · Test · Build`
  doit être **vert** (mode `strict` : branche à jour avec `dev`) pour merger. → resync `dev`
  dans `llm` avant la PR. Override admin possible (urgence), pas de review forcée (mono-dev).
- Assets en **Git LFS** (`.gitattributes`) → le checkout CI utilise `lfs: true`.
- **Publication d'images Docker (job `docker`)** : sur **tag `v*.*.*` uniquement**, et **gated** sur
  `build` + `e2e` verts. Build + push des 4 images à Dockerfile (`web`, `admin`, `image-processor`,
  `migrate`) vers **GitHub Packages (`ghcr.io/<repo>/<service>`)**, tags `X.Y.Z` + `latest`,
  `linux/amd64`, auth `GITHUB_TOKEN` (`packages: write`). Les images sont **privées** par défaut
  (le déploiement s'authentifie avec un PAT `read:packages`).

## Tags & releases
- Format: `vX.Y.Z` (semantic versioning)
- Patch++ bug fixes | Minor++ features | Major++ breaking
- **Un tag `vX.Y.Z` (sur `main`) déclenche la publication des images Docker** (cf. CI). C'est le
  point d'entrée release → déploiement (pas de branche `prod` : `main` joue ce rôle).

## Forbidden
- **Push direct / tag de l'IA sur `main` ou `dev`** (l'IA passe TOUJOURS par `llm` + PR).
- **Merge de l'IA sur `main`** (réservé à l'utilisateur). Le merge `llm → dev` suit la « Règle de merge PR ».
- **Merge d'une PR rouge** (CI non verte) — corriger d'abord.
- Force push to main
- Amending published commits
- Uncommitted code before switching branches
