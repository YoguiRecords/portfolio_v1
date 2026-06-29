# TASKS — backlog actionnable (BO v2)

> Backlog uniquement. On retire une tâche quand elle est **livrée** (mergée sur `dev`).
> Détails : `docs/plans/2026-06-29-bo-v2-roadmap.md` + plans par phase `docs/plans/2026-06-29-phase-NN-*.md`.
> Règle : 1 phase = 1+ PR atomique `llm → dev`. DoD transverse (sécu/tests/i18n/a11y/responsive/docs) dans la roadmap.

## Décisions verrouillées
- Mail = **Microsoft Graph** · Boîte unique = **Mails + Messages** (RDV à part) · **CRM complet** · **tout le BO** par phases.

## Backlog (ordre conseillé)

- [ ] **P7 — Témoignages** (modération) — `phase-07-temoignages.md`
- [ ] **P8 — Agenda / Events + Demandes de RDV** (accepter/refuser → agenda) — `phase-08-agenda-rdv.md`
- [ ] **P9 — Boîte de réception unique** (Mails + Messages) — `phase-09-inbox.md`
- [ ] **P10 — CRM : schéma & socle** (migration + rôles DB) — `phase-10-crm-schema.md`
- [ ] **P11 — CRM : UI** (Contacts, Sociétés, Pipeline, activités/relances) — `phase-11-crm-ui.md`
- [ ] **P12 — Mission Control** (agrégation) — `phase-12-mission-control.md`
- [ ] **P13 — Assistant IA + Calendrier** (reskin) — `phase-13-ia-calendrier.md`
- [ ] **P14 — Réglages + SEO/FAQ + recherche ⌘K** — `phase-14-reglages-recherche.md`
- [ ] **P15 — Finitions transverses** (états vides/erreur, a11y, responsive, E2E, docs) — `phase-15-finitions.md`
- [ ] **P16 — Multi-users BO + RBAC** (rôles + permissions, VIEWER read-only + masquage PII, invitations) — `phase-16-bo-users-rbac.md`
- [ ] **P17 — Chatbot public IA** (rendre fonctionnel : prochain évènement + contenu site + garde-fous + RDV) — `2026-06-30-phase-17-public-chatbot.md`

## Livré
- [x] **P0 — Design system & tokens** — tokens `@theme` + 18 primitives UI testées (barrel `@/components/ui`).
- [x] **P1 — Shell v2** — rail icônes groupé + topbar (search ⌘K placeholder/notif/Créer/avatar) + bottom bar mobile + tiroir, compteurs serveur.
- [x] **P2 — Dashboard v2** — KPIs + trafic Umami (fallback) + « à traiter » + top contenus, sur primitives P0.
- [x] **P3 — Projets** — liste DataTable (recherche/filtre/pagination/suppression confirmée) + éditeur entête avec aperçu live (composant `live-preview` réutilisable) + blocs préservés.
- [x] **P4 — Articles** — liste DataTable + éditeur markdown (aperçu live réutilisé) + programmation (SCHEDULED/scheduledAt) + tags/SEO + renderer markdown sûr admin.
- [x] **P5 — Profil / Home / CV** — form « Me concernant » v2 + aperçu live « À propos », sections home reskin, éditeur CV HTML isolé (iframe sandbox).
- [x] **P6 — Médias** — dropzone (pipeline webp/MinIO inchangé) + grille v2 + panneau détails (dimensions/poids/format/durée), support VIDEO/EMBED.

## En cours
- **P7 — Témoignages (modération)**.

## Bloqué / à arbitrer
- _(rien)_
