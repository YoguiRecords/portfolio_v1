# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Base de données
- [ ] Rôles Postgres séparés (`web` lecture seule, `admin` RW, `umami`) — à câbler avec l'infra Docker.
- [ ] (Option DX) Décider d'ajouter `dotenv` pour auto-charger `.env` dans les commandes Prisma.

## Infrastructure Docker
- [ ] `docker-compose.yml` : 7 services + réseaux `edge` / `internal` (formaliser la DB dev, actuellement container ad-hoc `portfolio-dev-db:5436`).
- [ ] Dockerfiles multi-stage non-root (web, admin, converter).
- [ ] Caddyfile : routage 3 sous-domaines + `/media`, HTTPS auto, en-têtes sécu.
- [ ] Container `converter` (image → webp + strip EXIF).
- [ ] MinIO : bucket `media` public en lecture, credentials écriture serveur (ports 9100/9101).
- [ ] Umami : service + base `umami` + rôle dédié (port hôte 3102).

## Fonctionnalités
- [ ] Site public (`web`) : page d'accueil (hero/footer depuis `Profile`), **page CV** (rend le HTML stocké, isolé + bouton PDF), pages projets, news/articles.
- [ ] Back office (`admin`) : auth durcie (MFA, rate-limit), CRUD **Profile/SocialLink/Project/Technology/Article/MediaAsset**, éditeur du **CV HTML**.
- [ ] Pipeline upload sécurisé (validation Zod + converter + MinIO → `MediaAsset`).

## Transverse
- [ ] Tests (Vitest + Playwright) sur les parcours critiques.
- [ ] Docs `docs/technical/` (ARCHITECTURE, SECURITY, API_REFERENCE).
- [ ] Appliquer la **DA** (`.claude/rules/DESIGN_SYSTEM.md`) via le thème Tailwind quand on construit le site.
- [ ] (Optionnel) Décider du passage TS 6 / ESLint 10 (majeures dispo, gardées en 5/9 testées par Next 16).
