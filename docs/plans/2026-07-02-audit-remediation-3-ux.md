# Audit Remediation 3 — UX / i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger les constats UX de l'audit §6 : 404/erreurs à la DA, sélecteur de
créneaux utilisable, unification des deux parcours RDV, chat/booking bilingue, onglet
Annulés au BO, accessibilité du chat.

**Architecture:** Le widget chat devient consommateur des catalogues next-intl déjà chargés
(décision P2-4 : **les catalogues `messages/*.json` deviennent la source des libellés de
chrome/widget** ; les gros blocs éditoriaux type `public-cv` gardent leurs LABELS colocalisés —
pragmatique, pas de big-bang). Chaque tâche UI se termine par une validation navigateur
MCP Playwright desktop (1280) + mobile (390), captures à l'appui.

**Tech Stack:** Next.js 16, next-intl, CSS modules + tokens DA, Vitest + RTL, MCP Playwright.

---

### Task 1: Pages 404 / erreur à la DA (§6.2)

**Files:**
- Create: `apps/web/app/[locale]/not-found.tsx`, `apps/web/app/[locale]/error.tsx` (client),
  `apps/web/app/global-error.tsx`, `apps/web/app/not-found.tsx` (hors locale → redirige/rend FR)
- Test: `apps/web/components/…` selon découpage (render RTL : titre + lien retour)

**Step 1: Test RTL (failing)** — la 404 affiche un code « 404 », un message FR et un lien
vers `/`.

**Step 2: Implémentation** — composition simple : fond `--dark-900`, numéro en or poids 900
(esprit stat-card), phrase courte, CTA « Retour à l'accueil » (pattern bouton or existant).
`error.tsx` : message générique + bouton `reset()`. Pas de détail technique affiché.

**Step 3: Vérifier** — `pnpm --filter web test` puis navigateur :
`/projets/nexiste-pas` (desktop + mobile, captures). `generateMetadata` : titre « 404 ».

**Step 4: Commit** — `feat(web): branded not-found and error pages`.

---

### Task 2: Sélecteur de créneaux groupé + durée affichée (§6.3)

**Files:**
- Modify: `apps/web/components/chat-widget/booking-form.tsx` + `chat-widget.test.tsx`
- Test: nouveau `booking-form.test.tsx` (groupement pur)

**Step 1: Extraire une fonction pure `groupSlotsByDay(slots: string[]): Array<[string, string[]]>`**
(clé = jour formaté Europe/Paris) — test d'abord (2 jours, ordre conservé, piège Intl
cross-realm : asserter via les valeurs, pas via `Intl` recalculé dans le test — cf. memory).

**Step 2: Rendu** — `<optgroup label="jeudi 2 juillet">` + options « 09:00 » ; sous le
select, ligne discrète : « Créneaux de 30 min · heure de Paris ».

**Step 3: Validation navigateur** desktop + mobile : ouverture du select, groupes lisibles,
soumission bout-en-bout d'un RDV réel (puis **le supprimer/refuser au BO** pour ne pas
laisser de données de test), captures.

**Step 4: Commit** — `feat(web): day-grouped booking slots + duration hint`.

---

### Task 3: Unifier le RDV de `/contact` sur les vraies disponibilités (§6.1)

**Files:**
- Create: `apps/web/components/forms/slot-select.tsx` (client : fetch `/api/availability`,
  réutilise `groupSlotsByDay`) + test RTL (états loading/vide/chargé, fetch mocké)
- Modify: le formulaire RDV de `/contact` (remplacer l'input `datetime-local` par
  `<SlotSelect name="requestedAt" optional />` — option « Aucun créneau précis »)
- Modify si besoin: la route `/api/appointments` (elle accepte déjà un ISO ; vérifier que
  l'optionnel reste accepté)

**Step 1: Test RTL du composant (failing) → implémentation → tests verts.**

**Step 2: Comportement** — le champ reste **optionnel** (un RDV « contact » sans créneau
reste possible) mais quand un créneau est choisi c'est un créneau réel. Mention explicite :
« Créneau de 30 min, sous réserve de confirmation ».

**Step 3: Validation navigateur** desktop + mobile sur `/contact` (captures), soumission
réelle + nettoyage BO.

**Step 4: Commit** — `feat(web): contact appointment form uses real availability slots`.

---

### Task 4: Chat + booking bilingues via next-intl (§6.4, P2-4)

**Files:**
- Modify: `apps/web/messages/fr.json`, `en.json` (namespace `chat` : greeting, placeholders,
  états, erreurs, libellés booking)
- Modify: `chat-widget.tsx`, `booking-form.tsx` (`useTranslations("chat")`,
  `slotLabel(iso, locale)`)
- Test: adapter `chat-widget.test.tsx` (wrapper `NextIntlClientProvider` + messages de test)

**Step 1: Catalogues** (fr d'abord, en miroir). **Step 2: Substitution + locale dans
`slotLabel`/`groupSlotsByDay`.** **Step 3: Tests verts.** **Step 4: Navigateur `/en` :
widget en anglais, créneaux en anglais (captures) ; `/` reste FR.**

**Step 5: Commit** — `feat(web): bilingual chat widget and booking form via next-intl`.

**Note décision P2-4** : consigner dans `docs/audit/2026-07-01-audit.md` (P2-4 résolu :
catalogues = chrome/widget ; LABELS colocalisés conservés pour les projections éditoriales).

---

### Task 5: BO `/rdv` — onglet « Annulés » (§6.5)

**Files:**
- Modify: `apps/admin/components/rdv/rdv-list.tsx` (+ test si le composant en a un)
- Modify si besoin: `apps/admin/app/(dashboard)/rdv/page.tsx` (statuts passés au composant)

Ajouter l'onglet (`CANCELLED` → « Annulés », badge neutre), vérifier au navigateur avec le
RDV annulé de test, capture, commit `feat(admin): cancelled tab on appointments list`.

---

### Task 6: Accessibilité du chat (§6.8)

**Files:**
- Modify: `apps/web/components/chat-widget/chat-widget.tsx` + `chat-widget.module.css` + test

- `role="log"` + `aria-live="polite"` sur le fil ; indicateur « {name} écrit… » (petit
  élément animé DA-compatible) pendant `pending` ; test RTL : l'indicateur apparaît pendant
  l'attente (fetch mocké lent) et disparaît après.
- Validation navigateur (desktop + mobile) : envoi d'un message réel, indicateur visible.
- Commit — `feat(web): chat live-region + typing indicator`.

---

### Task 7: Tokens DA dans le SVG « Le cap » (P3-4)

**Files:**
- Modify: `apps/web/components/sections/cap-trajectory.tsx`

Remplacer les 3 hex (`#9a6000`, `#f0a800`, `#3a3d41`) par `var(--accent-strong)`,
`var(--accent)` et un token gris existant (les `stopColor`/`stroke` SVG acceptent
`var()` en HTML inline). Vérifier au navigateur que le dégradé est intact (capture desktop —
la section a un rendu spécifique mobile, vérifier les deux). Commit
`style(web): cap trajectory uses DA tokens instead of raw hex`.

---

### Task 8: Gate final + doc

- `pnpm -r lint && pnpm -r typecheck && pnpm test && pnpm test:e2e`
- Mettre à jour : `docs/technical/API_REFERENCE.md` (si contrat bougé), patch note,
  `PROGRESS.md`, `TASKS.md`.
- Nettoyer les captures d'audit de la racine du repo.
