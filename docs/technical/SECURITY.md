# SECURITY

Posture de sécurité du portfolio. La cybersécurité prime sur tout le reste : chaque décision est
évaluée à l'aune de la surface d'attaque ajoutée. Détail opérationnel : `.claude/rules/STACK_SECURITY.md`.

## Isolation réseau
- Seul le reverse proxy est exposé à Internet. Base de données, converter et écriture MinIO vivent
  sur un réseau interne sans accès Internet.
- Les navigateurs ne communiquent qu'avec les applications Next.js et la lecture des médias publics.

## Moindre privilège (base de données)
- `app_web` : rôle **lecture seule** utilisé par le site public.
- `app_admin` : rôle **lecture/écriture** utilisé par le back office.
- Le rôle propriétaire est réservé aux migrations.

## Stockage des médias
- Bucket `media` en **lecture publique** uniquement (images destinées à être publiques).
- L'écriture est réservée au serveur (credentials non exposés au navigateur).

## Reverse proxy
- HTTPS automatique en production. En-têtes de sécurité appliqués à toutes les réponses :
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`. En-tête `Server` masqué.

## Back office
Le back office est accessible en ligne et durci : authentification forte (mots de passe hachés
argon2), **MFA**, rate-limit et lockout sur le login, cookies de session `httpOnly`/`Secure`/`SameSite`,
protection CSRF, messages d'erreur génériques (anti-énumération).

## Pipeline d'upload
Validation type MIME / taille / dimensions, **ré-encodage systématique** en webp (neutralise la
plupart des payloads), suppression des métadonnées EXIF, noms de fichiers randomisés, stockage hors
webroot, aucune exécution de fichier uploadé.

## Rendu de contenu
Le CV (HTML, édité au back office par un administrateur de confiance) est rendu de façon isolée
(iframe `srcdoc` + CSP). Les articles en markdown passent par un renderer sûr (pas d'injection HTML
brute non assainie).

## Données & secrets
- Validation de toutes les entrées externes (Zod) aux frontières.
- Requêtes paramétrées (Prisma) → pas d'injection SQL.
- Aucun secret en dur ni dans une image Docker ; `.env` git-ignoré.
- Conteneurs non-root, images minimales ; dépendances suivies (Dependabot) et scannées (CodeQL).
