## Documentation Technique — Conventions

### Principe : décrire l'état courant, intemporellement
- La doc descriptive (architecture, API, diagrammes, guides) décrit le système **tel qu'il est
  maintenant**, jamais le chemin de livraison qui y a mené.
- **Interdit** dans ces docs : « Phase 1/2/3 », numéros de version inline (« (v0.82.0) »), renvois
  « décision 34 », ou toute mention d'une modification/livraison passée. Ces marqueurs n'ont de sens
  qu'au moment de l'écriture ; relus à froid quelques mois plus tard, ils embrouillent au lieu d'aider.
- Écrire le **comportement** (« la preview couvre les apps web et les API ; une API servant une doc
  OpenAPI voit son URL pointer le chemin de doc »), pas l'historique (« la Phase 3 a ajouté… »).
- **Exceptions** — docs temporels par nature : les changelogs (`docs/patch_notes/`) et les champs
  « version courante / dernière livraison » de `PROGRESS.md`. Le journal de décisions garde ses entrées
  datées par version (c'est un log), mais le **corps** d'une entrée reste descriptif.

### Architecture Decision Records (ADR)
- Format : `docs/adr/YYYY-MM-DD-titre.md`
- Sections : Contexte | Décision | Conséquences | Alternatives rejetées
- Une ADR par décision structurante. Jamais modifiée après adoption (créer une nouvelle pour amender).

### README
- Structure obligatoire : Présentation | Prérequis | Installation | Usage | Architecture | Contribution
- Le README est le point d'entrée — doit permettre de démarrer en < 10 minutes.
- Pas de screenshots obsolètes. Préférer des exemples de code à jour.

### Guides d'architecture
- Un document par composant/service majeur.
- Inclure : responsabilité, interfaces exposées, dépendances, contraintes.
- Diagrammes en Mermaid (versionnable, pas de binaires).

### Documentation interne (wiki)
- Décisions de design non structurelles → wiki, pas ADR.
- Runbooks opérationnels : étapes numérotées, commandes copiables, résultats attendus.
- Règle : si quelqu'un doit chercher plus de 5 minutes, c'est à documenter.
