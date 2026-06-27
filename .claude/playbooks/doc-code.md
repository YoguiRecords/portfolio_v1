## Code Documentation — Conventions

### Principes
- Documenter le POURQUOI, jamais le QUOI (le code dit déjà quoi).
- Tout membre public doit être documenté. Code interne : seulement si logique non évidente.
- Mettre à jour la doc en même temps que le code — doc obsolète est pire qu'absente.

### TypeScript / JavaScript (JSDoc)
- `@param`, `@returns`, `@throws` sur toutes les fonctions exportées.
- `@example` pour les utilitaires réutilisables.
- Interfaces et types exportés : commentaire JSDoc sur chaque propriété non triviale.

### C# (XML Doc)
- `<summary>`, `<param>`, `<returns>`, `<exception>` sur tous les membres publics.
- `<remarks>` pour les détails d'implémentation importants.
- Pas de `/// <summary>Gets or sets X.</summary>` — trivial = inutile.

### Python (Google-style Docstrings)
- `Args:`, `Returns:`, `Raises:` sur toutes les fonctions publiques.
- Module-level docstring si le module a une responsabilité non évidente.

### Commentaires inline
- FORBIDDEN : commenter ce que le code dit déjà (`i++ // increment i`).
- Utiliser pour : contournements de bugs externes, décisions de performance, contraintes métier.
- TODO/FIXME : toujours avec un ticket de référence (`// TODO #123`).
