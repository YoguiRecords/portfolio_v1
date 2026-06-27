## Description

<!-- Quoi et pourquoi. Lier l'issue : Closes #__ -->

## Type

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] chore / test

## Checklist sécurité (NON-NÉGOCIABLE)

- [ ] Toutes les entrées externes validées (Zod)
- [ ] Aucun secret committé ni présent dans une image Docker
- [ ] Aucun nouveau port exposé sans justification
- [ ] Auth/permissions vérifiées sur les routes `admin`
- [ ] Upload (le cas échéant) : validation + ré-encodage + strip EXIF en place

## Checklist qualité

- [ ] Tests ajoutés/mis à jour (Vitest / Playwright) et passants
- [ ] Lint + typecheck OK
- [ ] Docs impactées mises à jour (PROGRESS, TASKS, patch notes, technical/)
