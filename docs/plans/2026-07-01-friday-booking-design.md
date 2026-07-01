# Design — Réservation de créneaux par Friday

> Date : 2026-07-01 · Statut : **validé** · Branche : `llm`
> Objectif : Friday (e-secrétaire IA public) propose de **vrais créneaux libres**,
> collecte l'identité du visiteur, crée une demande de RDV qui **bloque le créneau
> immédiatement (même en attente)**, prévient par email, et permet l'**annulation
> self-service**. Yohan valide/refuse/annule au BO et déclare ses indisponibilités.

## 1. Décisions verrouillées (brainstorming)

| # | Décision |
|---|----------|
| 1 | **Fenêtre par défaut : lundi→samedi, 9h→20h** (dimanche off). Créneaux **30 min à l'heure pile** (9:00…19:00). Constantes `packages/core` (éditable BO plus tard — YAGNI v1). |
| 2 | **Busy = Outlook (Graph)** + RDV `PENDING`+`CONFIRMED` + `Unavailability` (vacances/indispo déclarées au BO). |
| 3 | **Suivi visiteur = emails + annulation self-service** (token). |
| 4 | **Saisie = carte-formulaire interactive dans le chat** (pas de tool-calling LLM). |
| 5 | Raison stockée dans le champ `topic` existant. Fenêtre en constantes. Retrait de l'INSERT direct `app_web` sur les RDV. |

## 2. Données (Prisma)

- **`AppointmentRequest`** — ajouts : `firstName`, `lastName`, `phone`, `cancelToken`
  (unique, aléatoire crypto). `requestedAt` = créneau, `durationMin` (défaut 30).
  Raison → champ `topic` existant.
- **Blocage** : `PENDING` **ou** `CONFIRMED` bloque ; `DECLINED`/`CANCELLED` libèrent.
- **Anti double-booking** : index unique **partiel** Postgres sur `requestedAt`
  où `status IN ('PENDING','CONFIRMED')` (migration SQL brute).
- **Nouveau modèle `Unavailability`** : `{ id, startAt, endAt, reason?, createdAt }` —
  privé, `REVOKE ALL app_web`.
- Migration : `REVOKE INSERT` de `app_web` sur `AppointmentRequest` (booking passe
  désormais par admin). Vérifier l'impact sur le formulaire contact public.

## 3. Calcul des dispos (source de vérité = **admin**)

Fonction pure testable `computeFreeSlots({ from, to, busy, unavailabilities, now, config })`
dans `packages/core` : un créneau candidat (fenêtre §1) est **libre** s'il ne chevauche
**aucun** busy, **aucune** `Unavailability`, et n'est **pas passé**.

- `busy` = calendrier composite admin (`getCalendar()` : `DbCalendar` + `GraphCalendar`).
- ⚠️ **Étendre `DbCalendar`** pour inclure les RDV **`PENDING`** (aujourd'hui CONFIRMED
  seulement) → nécessaire pour bloquer les créneaux en attente.

## 4. Frontière sécurité web ↔ admin

`apps/web` (rôle `app_web` **lecture seule**) **ne lit jamais** RDV ni calendrier privé.
Tout passe par des **routes internes admin** token-gardées (`X-Internal-Token` =
`APPOINTMENTS_INTERNAL_TOKEN`, réseau `internal`, jamais via proxy — pattern `cv-renderer`) :

- `GET  /api/internal/availability?from&to` → créneaux libres (ISO only, **zéro PII**).
- `POST /api/internal/appointments` → Zod + **re-check atomique** du créneau + création
  `PENDING` + email « demande reçue » → renvoie ok (+ éventuel identifiant public).
- `POST /api/internal/appointments/cancel` → annulation par `cancelToken` → libère + email.

## 5. Web (Friday + widget)

- Widget : au moment de réserver, **carte-formulaire dans le chat** (prénom, nom, email,
  tél, raison + sélecteur de créneau alimenté par les vrais créneaux libres).
- Routes web publiques (proxy) :
  - `GET  /api/availability` → proxifie l'appel interne admin.
  - `POST /api/appointments` → **re-routé** vers l'endpoint interne admin (rate-limit +
    honeypot conservés).
  - Page `/rdv/annuler?token=…` → appelle l'annulation interne.
- LLM : Friday reste conversationnel pour **proposer** les créneaux (liste réelle injectée
  au contexte) ; **saisie/soumission = formulaire**. L'ancien `book_appointment` non câblé
  (`lib/chat/booking.ts`) est retiré.

## 6. Admin (BO)

- **Nouvelle page Disponibilités / Vacances** : CRUD `Unavailability`.
- `/rdv` : **Accepter** → `CONFIRMED` + évènement Outlook (existant) + **email confirmation**
  (date + lien/lieu + lien annulation) ; **Refuser/Annuler** → libère + email ; ajout d'un
  bouton **Annuler** sur un RDV `CONFIRMED`.
- `/calendrier` : afficher aussi RDV **`PENDING`** + `Unavailability`.

## 7. Emails (via `GraphMailbox`, centralisés admin, best-effort)

- Demande reçue (visiteur) → « Yohan validera dès que possible » + lien annulation.
- Confirmée (visiteur) → date + lien/lieu + lien annulation.
- Refusée/Annulée (visiteur) → notification.
- Si Graph off : log, la demande reste enregistrée (best-effort, jamais bloquant).
- Lien de réunion = champ que Yohan remplit à l'acceptation.

## 8. Tests + validation

- Unit `packages/core` : `computeFreeSlots` (chevauchements, passé, vacances, bords de
  fenêtre, dimanche exclu), schéma Zod (nouveaux champs).
- Admin : route availability (token), booking atomique (double-book rejeté), cancel token,
  emails best-effort (mock Graph).
- Web : carte-formulaire (rendu + soumission), proxy availability.
- **E2E Playwright + validation navigateur réelle desktop/mobile** — NON-NÉGOCIABLE.

## 9. Sécurité (rappels appliqués)

- Tout RDV/calendrier via routes internes admin token-gardées ; `app_web` ne lit rien de
  privé. Retrait de l'INSERT direct `app_web` sur `AppointmentRequest`.
- Zod à toutes les frontières. `cancelToken` aléatoire crypto. Rate-limit conservé.
- `Unavailability` → `REVOKE ALL app_web`. Emails texte-only (pas de HTML distant).
