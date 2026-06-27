# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Base de données
- [x] Rôles Postgres séparés (`app_web` lecture seule, `app_admin` RW, `umami`) + câblage `DATABASE_URL`.
- [ ] (Option DX) Décider d'ajouter `dotenv` pour auto-charger `.env` dans les commandes Prisma.

## Infrastructure Docker
- [x] Phase A : `docker-compose.yml` (db + minio + umami), réseaux `edge`/`internal`, base/rôle `umami`.
- [x] Phase B : service **`converter`** (`services/converter`, Node/Fastify/sharp) + Dockerfile + ajout au compose.
- [x] Phase C : Dockerfiles multi-stage non-root **web**/**admin** (Next standalone) + ajout au compose.
- [x] Phase C : **proxy Caddy** (routage 3 sous-domaines + `/media`, en-têtes sécu ; HTTPS auto en prod).
- [x] MinIO : bucket `media` (lecture publique) via `minio-init`.
- [ ] MinIO : clé d'écriture serveur à privilège minimal (vs root) pour le back office.
- [ ] Prod hardening : sortir `db` de `edge` + retirer port 5436 (override prod), épingler images par digest.

## Fonctionnalités
- [ ] Site public (`web`) : page d'accueil (hero/footer depuis `Profile`), **page CV** (rend le HTML stocké, isolé + bouton PDF), pages projets, news/articles.
- [ ] Back office (`admin`) : auth durcie (MFA, rate-limit), CRUD **Profile/SocialLink/Project/Technology/Article/MediaAsset**, éditeur du **CV HTML**.
- [ ] Pipeline upload sécurisé (validation Zod + converter + MinIO → `MediaAsset`).

## Transverse
- [ ] Tests (Vitest + Playwright) sur les parcours critiques.
- [x] Docs initiales : `docs/technical/{ARCHITECTURE,SECURITY}.md`, `docs/erd/`, `docs/patch_notes/`.
- [ ] Docs à créer avec les features : `docs/technical/API_REFERENCE.md`, `E2E_TESTING.md`.
- [ ] Appliquer la **DA** (`.claude/rules/DESIGN_SYSTEM.md`) via le thème Tailwind quand on construit le site.
- [ ] (Optionnel) Décider du passage TS 6 / ESLint 10 (majeures dispo, gardées en 5/9 testées par Next 16).
