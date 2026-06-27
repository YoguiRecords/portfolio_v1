# STACK.md — Git

## Branches
- **main** — production | requires PR + tests passing
- **dev** — integration branch
- **feature/{name}**, **fix/{name}**, **refactor/{name}**, **chore/{name}**, **docs/{name}**

Naming: lowercase, hyphens, max 50 chars

## Commits (Conventional Commits)
```
<type>(<scope>): <subject>

<body>
<footer>
```

**Types:** feat | fix | refactor | style | test | docs | chore | perf

**Scopes:** web | admin | db | core | auth | proxy | storage | converter | newsletter | docker | docs

**Subject:** imperative, no period, max 50 chars

**Body:** explains why (not what), wrapped 72 chars, reference issues (`Closes #123`)

**Example:**
```
feat(kanban): add swimlane drag-and-drop

Implement horizontal drag for task cards across swimlanes.

Closes #234
```

## Workflow
1. Create branch: `git checkout -b feature/name`
2. Atomic commits (tests pass after each)
3. Push → PR
4. Review + tests
5. Merge to dev (delete branch)
6. dev → main when ready (tag with `vX.Y.Z`)

## Tags & releases
- Format: `vX.Y.Z` (semantic versioning)
- Patch++ bug fixes | Minor++ features | Major++ breaking

## Forbidden
- Force push to main
- Amending published commits
- Uncommitted code before switching branches
