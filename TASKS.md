# TASKS — backlog actionnable (BO v2)

> Backlog uniquement. On retire une tâche quand elle est **livrée** (mergée sur `dev`).
> Détails : `docs/plans/2026-06-29-bo-v2-roadmap.md` + plans par phase `docs/plans/2026-06-29-phase-NN-*.md`.
> Règle : 1 phase = 1+ PR atomique `llm → dev`. DoD transverse (sécu/tests/i18n/a11y/responsive/docs) dans la roadmap.

## Décisions verrouillées
- Mail = **Microsoft Graph** · Boîte unique = **Mails + Messages** (RDV à part) · **CRM complet** · **tout le BO** par phases.

## Backlog (ordre conseillé)

- [~] **P16 — Multi-users BO + RBAC** — **socle livré** (schéma+migration, moteur permissions core, politique mdp, gardes `requirePermission`/`assertCanWrite`, /403, masquage PII). **Reste (DT8)** : enforcement par page/action, filtre nav, UI gestion comptes, onboarding invitation, login isActive, zxcvbn. — `phase-16-bo-users-rbac.md`
- [x] **P17 — Chatbot public IA** — fonctionnel : contexte events à venir (prochain évènement) + contenu public + widget conditionné à l'activation. _Reste : toggle BO d'activation + câblage outil RDV (DT)._

## Recette QA (2026-07-01) — reste à traiter
- [ ] **Chatbot — câblage outil RDV** (P17 DT) : le prompt propose un rendez-vous, mais l'outil
  `book_appointment` n'est pas encore branché (créer un `AppointmentRequest` depuis le chat).
- [ ] **Chatbot — rendu markdown (option)** : le widget affiche la réponse en texte brut ; passer par
  le renderer markdown si l'on veut du gras/listes. _(modèle DeepSeek v4 flash + persona secrétaire
  synthétique livrés v0.8.2 — réponses déjà propres)._
- [ ] **Contenu — narratif « en solo »** (aiSummary Domestic Revolt, article `build-solo`) : à revoir
  au regard du positionnement « leader, pas solo » (décision de contenu, éditable au BO).

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
- [x] **Todo-list unifiée** — modèle `Task` générique (rename `CrmTask`, migration data-preserving), page `/taches` (kanban 4 statuts + filtres catégorie/« du jour »), Mission Control « tâches du jour », fiche contact adaptée (workflow `status`).
- [x] **P13 — IA + Calendrier (reskin)** — pages `/ai` + `/calendrier` passées à la DA v2 (tokens), fonctions inchangées.
- [x] **P14 — Réglages + FAQ + ⌘K** — reskin réglages (settings-form) + FAQ ; **command palette ⌘K** globale (navigation, ouverte par ⌘K/Ctrl+K ou bouton topbar). _Reste : recherche contenu DB dans la palette (DT)._
- [x] **P15 — Finitions** — docs finales (`ARCHITECTURE`/`API_REFERENCE`) + patch note **v0.5.0** + E2E guard des routes BO ; états vides/confirmations en place. _Reste : audit a11y complet + screenshots responsive authentifiés + E2E parcours connecté (DT7)._

## En cours
- _(toutes les phases P0→P17 passées ; reste le câblage RBAC **DT8** + dettes mineures listées dans `resume.md`)._

## Bloqué / à arbitrer
- _(rien)_
