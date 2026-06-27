# STACK.md — Sécurité (posture NON-NÉGOCIABLE)

> La cybersécurité prime sur tout le reste sur ce projet. Toute décision se mesure
> d'abord à son impact sur la surface d'attaque. Référence transverse : `.claude/playbooks/security-owasp.md`.

## 1. Isolation réseau (cf. STACK_DOCKER)
- Seul `proxy` (Caddy) est exposé (443). `db`, `converter`, écriture MinIO → réseau `internal`,
  **aucun accès Internet**.
- Le port Postgres n'est **jamais** publié en prod.
- Les navigateurs ne parlent qu'à Next.js (web/admin) ; jamais directement à DB/MinIO/converter.

## 2. Moindre privilège DB
- `web` → rôle **lecture seule** sur le contenu public.
- `admin` → rôle lecture/écriture cantonné.
- `umami` → base + rôle dédiés, ne voit que ses tables.

## 3. Back office (`bo.yohan-debusscher.com`) — public mais durci
Le BO est accessible en ligne (façon WordPress) → durcissement obligatoire :
- **MFA / 2FA obligatoire** sur le compte admin.
- Mots de passe hachés **argon2** (jamais en clair, jamais MD5/SHA1).
- **Rate-limit + lockout** sur le login (anti brute-force).
- Messages d'erreur **génériques** (pas d'énumération de comptes).
- Cookies de session `httpOnly` + `Secure` + `SameSite=Lax/Strict`.
- **CSRF** sur toutes les mutations.
- Idéalement : monitoring/alerting des tentatives de login échouées.

## 4. Pipeline d'upload d'images (surface sensible)
- Validation **mime + taille + dimensions** avant tout traitement.
- **Ré-encodage systématique via le converter** (webp) → neutralise la plupart des payloads.
- **Suppression des métadonnées EXIF**.
- **Noms de fichiers randomisés**, stockage hors webroot (MinIO).
- Jamais d'exécution de fichier uploadé ; pas de listing public du bucket.

## 5. Baseline applicative (OWASP)
- **Validation de toutes les entrées externes avec Zod** à la frontière (Server Actions, Route Handlers).
- Requêtes **paramétrées** (Prisma natif) → pas d'injection SQL.
- **Aucun secret en dur** ni dans une image Docker — `.env` git-ignoré / Docker secrets.
- En-têtes de sécurité au proxy (CSP, HSTS, X-Frame-Options, nosniff) — cf. `STACK_PROXY.md`.
- Newsletter : **double opt-in** + anti-énumération d'emails + rate-limit sur l'inscription.
- Dépendances : pas de nouvelle dépendance sans validation ; vérifier les CVE connues avant ajout.
- Conteneurs **non-root**, images minimales (cf. `STACK_DOCKER.md`).

## 6. Umami
- Cookieless / RGPD-friendly. Endpoint de collecte public ; **dashboard derrière l'auth Umami**.

## Checklist avant toute livraison
- [ ] Aucune entrée externe non validée (Zod).
- [ ] Aucun secret committé / dans une image.
- [ ] Aucun nouveau port exposé sans justification.
- [ ] Auth/permissions vérifiées sur les routes `admin`.
- [ ] Upload : validation + ré-encodage + EXIF strip en place.
