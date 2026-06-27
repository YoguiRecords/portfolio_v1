# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Base de données
- [ ] Schéma Prisma métier : CV, projets, abonnés newsletter (remplacer le modèle placeholder `HealthCheck`).
- [ ] Première migration (`prisma migrate dev`) + dossier `prisma/migrations`.
- [ ] Rôles Postgres séparés (`web` lecture seule, `admin` RW, `umami`).

## Infrastructure Docker
- [ ] `docker-compose.yml` : 7 services + réseaux `edge` / `internal`.
- [ ] Dockerfiles multi-stage non-root (web, admin, converter).
- [ ] Caddyfile : routage 3 sous-domaines + `/media`, HTTPS auto, en-têtes sécu.
- [ ] Container `converter` (image → webp + strip EXIF).
- [ ] MinIO : bucket `media` public en lecture, credentials écriture serveur (ports 9100/9101).
- [ ] Umami : service + base `umami` + rôle dédié (port hôte 3102).

## Fonctionnalités
- [ ] Site public (`web`) : pages CV, projets, inscription newsletter.
- [ ] Back office (`admin`) : auth durcie (MFA, rate-limit), CRUD contenu, upload images.
- [ ] Pipeline upload sécurisé (validation Zod + converter + MinIO).
- [ ] Newsletter : double opt-in + envoi.

## Transverse
- [ ] Tests (Vitest + Playwright) sur les parcours critiques.
- [ ] Docs `docs/technical/` (ARCHITECTURE, SECURITY, API_REFERENCE).
- [ ] (Optionnel) Décider du passage TS 6 / ESLint 10 (majeures dispo, gardées en 5/9 testées par Next 16).
