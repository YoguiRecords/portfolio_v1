# P-i18n — Site bilingue FR/EN (overlay + traduction IA) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> Standards : voir `2026-06-28-CODE-STANDARDS.md`.

**Goal:** Rendre le site bilingue FR/EN sans double-saisie : FR = source de vérité (colonnes actuelles), EN = **overlay** par champ avec **fallback FR**, **régénéré automatiquement par IA** à la validation d'un texte FR. UI chrome via `next-intl`.

**Architecture:** (1) UI chrome → `next-intl` (catalogues `fr`/`en`). (2) Contenu DB → table générique `Translation(model, recordId, field, locale, value, isAuto, sourceHash)`. Un helper `localize(record, translations, locale)` superpose l'EN (fallback FR). À l'enregistrement BO d'un champ FR : si l'EN est auto (ou absent) → **re-traduction IA** (port LLM, mock en test) ; si l'EN a été édité à la main → marqué **obsolète** (sourceHash ≠ hash FR), jamais écrasé. Routes `/` (FR) + `/en/...`, hreflang.

**Tech Stack:** next-intl, Prisma 7, Zod, port LLM (P0), Vitest, Playwright.

---

### Task 1: Modèle `Translation` + migration + grants

**Files:** Modify `packages/db/prisma/schema.prisma`; Create migration.

**Step 1:** Ajouter :
```prisma
model Translation {
  id         String   @id @default(cuid())
  model      String   // "Profile", "Project", "Article", "Event", "ProjectBlock", ...
  recordId   String
  field      String   // "bio", "title", "content", ...
  locale     String   // "en"
  value      String
  isAuto     Boolean  @default(true) // généré par IA (vs édité main)
  sourceHash String   // hash du texte FR source ayant produit cette trad
  updatedAt  DateTime @updatedAt
  createdAt  DateTime @default(now())
  @@unique([model, recordId, field, locale])
  @@index([model, recordId, locale])
}
```

**Step 2:** `prisma validate` → vert. Migration `--create-only --name translations`,
**grants** : SELECT public OK (default privileges) ; écriture `app_admin` seulement
(pas de REVOKE nécessaire pour la lecture). Appliquer + `generate` + `db:test:deploy`.

**Step 3:** Commit `feat(db): generic Translation overlay table`.

---

### Task 2: Helper `localize()` (pur, TDD)

**Files:** Create `packages/core/src/i18n/localize.ts`, Test `…/localize.test.ts`

**Step 1: Failing test**
```ts
import { expect, test } from "vitest";
import { localize } from "./localize";

const tr = [{ field: "title", locale: "en", value: "The profile" }];
test("EN superpose le champ traduit", () => {
  expect(localize({ id: "1", title: "Le profil" }, tr, "en", ["title"]).title).toBe("The profile");
});
test("fallback FR si pas de trad", () => {
  expect(localize({ id: "1", title: "Le profil" }, [], "en", ["title"]).title).toBe("Le profil");
});
test("FR (locale par défaut) ignore l'overlay", () => {
  expect(localize({ id: "1", title: "Le profil" }, tr, "fr", ["title"]).title).toBe("Le profil");
});
```

**Step 2:** Run → FAIL. **Step 3:** Implémenter (map `(field)->value` filtrée par locale, override des `fields` ciblés). **Step 4:** PASS. **Commit** `feat(core): localize overlay helper`.

---

### Task 3: Service de traduction IA (port LLM, TDD avec mock)

**Files:** Create `packages/core/src/i18n/translate.ts`, Test `…/translate.test.ts`

**Step 1: Failing test** (avec `mockLlm` de P0)
```ts
import { expect, test } from "vitest";
import { mockLlm } from "../testing/mock-llm";
import { translateFields } from "./translate";

test("translateFields renvoie une trad par champ + hash source", async () => {
  const llm = mockLlm(["The profile"]);
  const out = await translateFields(llm, { title: "Le profil" }, "en");
  expect(out[0]).toMatchObject({ field: "title", locale: "en", value: "The profile", isAuto: true });
  expect(out[0].sourceHash).toHaveLength(64); // sha-256 hex
});
```

**Step 2-4:** Implémenter : pour chaque champ, prompt « traduis fidèlement FR→<locale>, conserve le markdown, ne traduis pas les noms propres » → `value`, `sourceHash = sha256(fr)`. **Commit** `feat(core): AI field translation service`.

---

### Task 4: Détection de changement FR (TDD, anti-gaspillage de tokens)

**Files:** Create `packages/core/src/i18n/changed.ts`, Test `…/changed.test.ts`

**Règle produit** : dès que le FR change, l'EN est **réécrasé** (re-traduit), même
s'il avait été édité à la main. Ce helper sert seulement à **éviter un appel IA
inutile** quand le FR n'a pas bougé.
`frChanged(frValue, translation)` = `sha256(frValue) !== translation?.sourceHash`.
Test : FR modifié → `true` ; identique → `false` ; pas de trad → `true`.
**Commit** `feat(core): FR change detection for re-translation`.

---

### Task 5: Hook d'enregistrement BO (FR écrase EN)

**Files:** Create `apps/admin/lib/i18n/on-save-translate.ts`, Test `…/on-save-translate.test.ts` (DB de test + mock LLM)

**Logique (règle produit)** : après mise à jour d'un enregistrement FR, pour
chaque champ traduisible **dont le FR a changé** (`frChanged`), **re-traduire et
ÉCRASER l'EN** (upsert `isAuto=true`, `sourceHash=sha256(nouveauFR)`) — **même si
l'EN avait été édité à la main**. Si le FR n'a pas changé → ne rien faire (aucun
appel IA).

**Test** : modif FR (EN auto OU EN édité-main) → EN réécrasé par la nouvelle trad ;
FR inchangé → EN intact et **zéro appel LLM** (`mockLlm.calls` vide).
**Commit** `feat(admin): re-translate (overwrite) EN when FR changes`.

---

### Task 6: next-intl + routing `/en`

**Files:** Create `apps/web/messages/fr.json`, `apps/web/messages/en.json`, `apps/web/i18n.ts`, `apps/web/middleware.ts`; Modify `apps/web/app/layout.tsx` → `app/[locale]/layout.tsx`.

**Step 1:** Installer `next-intl` (validation design : OK). Config locales
`["fr","en"]`, défaut `fr`, préfixe `as-needed` (FR sans préfixe, EN `/en`).
Catalogues = **chrome uniquement** (nav actions, form, erreurs, « Lire plus »…).

**Step 2:** Les **loaders** (`lib/data/*`) prennent `locale` et appliquent
`localize()` (charger `Translation` du record). Mettre à jour P2/P3 en conséquence.

**Step 3:** Smoke E2E : `/en` répond, le chrome est en anglais.
**Commit** `feat(web): next-intl bilingual routing (fr default, /en)`.

---

### Task 7: `<LocalizedField>` au BO (EN caché par défaut)

**Files:** Create `apps/admin/components/localized-field/*` (+ `.module.css` + `.test.tsx`)

**Comportement** : champ **FR** visible ; bouton « 🇬🇧 EN » qui **déplie** la version
EN (**cachée par défaut**). En mode EN : zone éditable + bouton **« Sauvegarder
l'EN »** (enregistre la modif manuelle, `isAuto=false`) + bouton « Régénérer ».
Badge `auto` / `édité`. Mention claire : *« toute modification du FR réécrasera
l'EN »*. Test RTL : EN masqué au départ, visible après clic ; le bouton
« Sauvegarder l'EN » n'apparaît qu'en mode EN et déclenche la sauvegarde manuelle.
**Commit** `feat(admin): collapsible localized EN field with manual save`.

---

### Task 8: E2E bilingue

**Files:** Create `e2e/i18n.spec.ts` — la home `/en` affiche le contenu traduit
(seed une `Translation` EN d'un champ), le sélecteur de langue bascule.
**Commit** `test(e2e): bilingual home and language switch`.

---

## Definition of Done (P-i18n)
- UI chrome FR/EN (`next-intl`), routes `/` et `/en` + hreflang.
- Contenu DB : overlay EN avec fallback FR ; **EN régénéré à la validation FR**,
  **jamais d'écrasement** d'une trad éditée main (marquée « obsolète »).
- BO : EN **caché par défaut**, dépliable, avec badges.
- Tout testé (unit `localize`/`translate`/`staleness`/hook + E2E `/en`).
