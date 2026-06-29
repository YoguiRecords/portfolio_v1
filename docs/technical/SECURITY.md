# SECURITY

Posture de sécurité du portfolio. La cybersécurité prime sur tout le reste : chaque décision est
évaluée à l'aune de la surface d'attaque ajoutée. Détail opérationnel : `.claude/rules/STACK_SECURITY.md`.

## Isolation réseau
- Seul le reverse proxy est exposé à Internet. Base de données, image-processor et écriture MinIO
  vivent sur un réseau interne sans accès Internet.
- Les navigateurs ne communiquent qu'avec les applications Next.js et la lecture des médias publics.

## Moindre privilège (base de données)
- `app_web` : rôle **lecture seule** du contenu public, **+ INSERT seul** sur `ContactMessage`,
  `Testimonial` et `AppointmentRequest` (soumissions publiques). Il ne peut **jamais lire** ces
  tables ni définir un `status` (témoignage toujours `PENDING` → pas d'auto-validation) — toute la
  PII (email, IP, texte original) reste invisible côté public.
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
argon2id), **MFA TOTP obligatoire**, rate-limit par IP et lockout de compte sur le login, cookies de
session `httpOnly`/`Secure`/`SameSite`, protection CSRF, messages d'erreur génériques (anti-énumération).
- **Sessions opaques** : token aléatoire 256 bits en cookie ; seul son hash SHA-256 est stocké
  (pas de JWT). Validité vérifiée côté serveur (le proxy ne fait qu'une garde sur la présence du cookie).
- **Isolation des secrets** : les tables d'authentification (`AdminUser`, `Session`, `LoginAttempt`)
  sont inaccessibles au rôle `app_web` (REVOKE explicite) → une compromission du site public
  n'expose ni les hashes ni les secrets TOTP.
- Toutes les tentatives de connexion sont auditées (`LoginAttempt`).

## Pipeline d'upload
Validation type MIME / taille / dimensions, **ré-encodage systématique** en webp (neutralise la
plupart des payloads), suppression des métadonnées EXIF, noms de fichiers randomisés, stockage hors
webroot, aucune exécution de fichier uploadé.

## Soumissions publiques (anti-abus)
Les formulaires publics (contact, demande de RDV, témoignage) passent par des Route Handlers
validés **Zod**, protégés par un **honeypot** (champ caché) et un **rate-limit par IP**. L'ordre des
gardes laisse la base intacte en cas de rejet (rate-limit → parse → honeypot → Zod). Aucune lecture :
les données partent en `INSERT` seul vers la boîte de réception du back office.

## Rendu de contenu
Le CV (HTML, édité au back office par un administrateur de confiance) est rendu de façon isolée
(iframe `srcdoc` + CSP). Les articles/blocs en markdown passent par un **renderer sûr par
construction** : il produit des éléments React (jamais `dangerouslySetInnerHTML`), donc tout HTML
embarqué (`<script>`) est rendu en texte inerte ; les liens sont limités à `http(s)`/`mailto`/relatif
(pas de vecteur `javascript:`). Les embeds (iframe vidéo) n'acceptent que des sources `http(s)`.

## Mail & calendrier BO (Microsoft Graph, optionnel)
Intégration **OAuth2 app-only** (client credentials) sur une **boîte dédiée** (`contact@…`) : token
révocable scopé aux permissions Application (`Mail.ReadWrite`, `Mail.Send`, `Calendars.ReadWrite`),
aucun mot de passe stocké. Secrets (`AZURE_CLIENT_SECRET`) en `.env` uniquement. Le corps des mails
est **aplati en texte** avant affichage (pas de HTML distant rendu → pas de XSS). Boîte dédiée +
Application Access Policy → rayon de souffle limité. Détail : `docs/technical/INTEGRATIONS.md`.

## Assistant & chatbot IA
- La clé **OpenRouter** vit uniquement dans `.env` (jamais en base, jamais logguée). Un **budget de
  tokens** mensuel borne la dépense.
- Le **chatbot public** est **désactivé par défaut**. Son contexte est construit **exclusivement à
  partir de données publiques** (aucune PII). Le **prompt système à garde-fous** (toujours promouvoir
  Yohan, jamais un concurrent) est assemblé côté serveur, **séparé du message utilisateur** → une
  injection de prompt ne peut pas réécrire les règles. Endpoint soumis au rate-limit.

## Données & secrets
- Validation de toutes les entrées externes (Zod) aux frontières.
- Requêtes paramétrées (Prisma) → pas d'injection SQL.
- Aucun secret en dur ni dans une image Docker ; `.env` git-ignoré.
- Conteneurs non-root, images minimales ; dépendances suivies (Dependabot) et scannées (CodeQL).
