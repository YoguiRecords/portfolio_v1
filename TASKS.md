# TASKS — backlog actionnable (BO v2)

> Backlog uniquement. On retire une tâche quand elle est **livrée** (mergée sur `dev`).
> Détails : `docs/plans/2026-06-29-bo-v2-roadmap.md` + plans par phase `docs/plans/2026-06-29-phase-NN-*.md`.
> Règle : 1 phase = 1+ PR atomique `llm → dev`. DoD transverse (sécu/tests/i18n/a11y/responsive/docs) dans la roadmap.

## Décisions verrouillées
- Mail = **Microsoft Graph** · Boîte unique = **Mails + Messages** (RDV à part) · **CRM complet** · **tout le BO** par phases.

## Backlog (ordre conseillé)

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
- [x] **P7 — Témoignages** — file modération v2 (onglets statut, édition texte affiché vs original/audit, mise en avant, refus confirmé), hook CRM en stub.
- [x] **P8 — Agenda + RDV** — agenda reskin (liste/création/suppression/génération actu) + file RDV v2 (accepter→évènement calendrier best-effort / refuser confirmé). _Reste : éditeur event `[id]` (DT2)._
- [x] **P9 — Boîte de réception unique** — `lib/inbox/aggregate.ts` (Mails Graph + ContactMessage → InboxItem, tri/filtre, résilient) + page `/inbox` + détail `/inbox/[source]/[id]` + réponse (Graph). Mails/Messages absorbés (nav). RDV exclus.
- [x] **P10 — CRM schéma & socle** — modèles Prisma (Company/Contact/Deal/Activity/CrmTask) + migration **REVOKE app_web** (validée test DB) + schémas Zod `core/crm` + actions CRUD `crm-actions` (guard+Zod).
- [x] **P11 — CRM UI** — Contacts (liste + fiche 360° deals/activités/tâches), Sociétés, Pipeline (board par stage + déplacement). _Reste : DnD (DT4), agrégation 360° cross-domaine + hooks « créer contact » (DT5)._
- [x] **P12 — Mission Control** — agrégation `lib/data/mission-control.ts` (KPIs relation client, pipeline, tâches, à-traiter, aperçu inbox) + page dédiée.
- [x] **P13 — IA + Calendrier (reskin)** — pages `/ai` + `/calendrier` passées à la DA v2 (tokens), fonctions inchangées.
- [x] **P14 — Réglages + FAQ + ⌘K** — reskin réglages (settings-form) + FAQ ; **command palette ⌘K** globale (navigation, ouverte par ⌘K/Ctrl+K ou bouton topbar). _Reste : recherche contenu DB dans la palette (DT)._

## En cours
- **P15 — Finitions transverses**.

## Bloqué / à arbitrer
- _(rien)_
