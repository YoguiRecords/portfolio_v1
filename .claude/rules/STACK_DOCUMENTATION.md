# STACK.md — Documentation

## Overview
- Format : Markdown (GitHub-flavored) | Dossier : `docs/`

## Principe NON-NÉGOCIABLE — décrire l'état courant, intemporellement
La doc descriptive (`docs/technical/*`, guides…) décrit le système **tel qu'il est
maintenant**, jamais le chemin de livraison. **Interdit** : « Phase 1/2/3 », versions inline
(« (v0.3.0) »), mentions d'une modification passée. Écrire le comportement, pas l'historique.
**Exceptions** (temporels par nature) : `docs/patch_notes/` et les champs version de `PROGRESS.md`.

## Structure docs/
```
docs/
├── technical/            # Architecture, API, sécurité — MAINTENU
│   ├── ARCHITECTURE.md       — Vue système (services, réseaux, flux)
│   ├── SECURITY.md           — Posture sécu (isolation, auth BO, upload)
│   └── API_REFERENCE.md      — Server Actions / Route Handlers
├── patch_notes/          # Historique versions (un fichier par minor)
└── planning/
    └── todo.md               — Backlog actionnable
```

## Mandatory Update Rule (NON-NÉGOCIABLE)
À chaque fin de livraison, **AVANT de push**, mettre à jour TOUS les documents impactés.

| # | Document | Quand |
|---|----------|-------|
| 1 | `PROGRESS.md` | **TOUJOURS** (état + dernière livraison) |
| 2 | `TASKS.md` | **TOUJOURS** (retirer la tâche livrée — backlog uniquement) |
| 3 | `docs/patch_notes/patch_note_V{major}_{minor}.md` | **TOUJOURS** |
| 4 | `docs/technical/ARCHITECTURE.md` | Si service/réseau/flux ajouté ou modifié |
| 5 | `docs/technical/SECURITY.md` | Si la posture de sécu change |
| 6 | `docs/technical/API_REFERENCE.md` | Si une Server Action / Route Handler change |

## Code-level documentation
- TypeScript : **JSDoc** sur fonctions/composants exportés.
- Inline : expliquer le **pourquoi** (pas le quoi), pas de commentaire évident.
- Détail : `.claude/playbooks/doc-technique.md` et `.claude/playbooks/doc-code.md`.

## Commit doc
```
docs(<scope>): update <files> for v<version>
```
