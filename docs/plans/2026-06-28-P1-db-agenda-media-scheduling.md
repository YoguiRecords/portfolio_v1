# P1 — DB: Agenda, Média vidéo, Publication programmée & RDV — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compléter le schéma DB avec l'Agenda/Événements (date/heure/lieu, lien d'inscription externe, public/fermé), le support **vidéo/embed** des médias, la **publication programmée** des actus, et les **demandes de RDV** — migration, grants de moindre privilège, seed.

**Architecture:** Additif au schéma Prisma existant. Sécurité : `app_web` peut INSÉRER une demande de RDV mais jamais lire les autres (comme `ContactMessage`) ; les évènements/médias publics gardent le SELECT par défaut. La logique de **publication programmée** est une fonction pure testée + un déclencheur (route admin protégée appelable par cron).

**Tech Stack:** Prisma 7, Postgres (schéma `public` dev / `test` en test), Vitest.

---

### Task 1: Service de publication programmée (logique pure, TDD)

**Files:** Create `packages/core/src/publishing/due.ts`, Test `packages/core/src/publishing/due.test.ts`

**Step 1: Write the failing test**
```ts
import { expect, test } from "vitest";
import { isDue, splitDue } from "./due";

test("isDue: scheduled in the past is due, future is not", () => {
  const now = new Date("2026-06-28T10:00:00Z");
  expect(isDue({ status: "SCHEDULED", scheduledAt: new Date("2026-06-28T09:00:00Z") }, now)).toBe(true);
  expect(isDue({ status: "SCHEDULED", scheduledAt: new Date("2026-06-28T11:00:00Z") }, now)).toBe(false);
  expect(isDue({ status: "PUBLISHED", scheduledAt: null }, now)).toBe(false);
});

test("splitDue partitions items by due date", () => {
  const now = new Date("2026-06-28T10:00:00Z");
  const items = [
    { id: "a", status: "SCHEDULED", scheduledAt: new Date("2026-06-28T09:00:00Z") },
    { id: "b", status: "SCHEDULED", scheduledAt: new Date("2026-06-28T12:00:00Z") },
  ] as const;
  const { due, pending } = splitDue([...items], now);
  expect(due.map((i) => i.id)).toEqual(["a"]);
  expect(pending.map((i) => i.id)).toEqual(["b"]);
});
```

**Step 2:** Run: `pnpm --filter @portfolio/core exec vitest run src/publishing/due.test.ts` → FAIL.

**Step 3: Implement**
```ts
// due.ts
export interface Schedulable { status: string; scheduledAt: Date | null }
export function isDue(item: Schedulable, now: Date): boolean {
  return item.status === "SCHEDULED" && item.scheduledAt != null && item.scheduledAt <= now;
}
export function splitDue<T extends Schedulable>(items: T[], now: Date): { due: T[]; pending: T[] } {
  const due: T[] = []; const pending: T[] = [];
  for (const it of items) (isDue(it, now) ? due : pending).push(it);
  return { due, pending };
}
```

**Step 4:** Run → PASS.

**Step 5:** Commit.
```bash
git add packages/core/src/publishing
git commit -m "feat(core): scheduled-publish due logic with tests"
```

---

### Task 2: Modèles Prisma (Agenda, média vidéo, programmation, RDV)

**Files:** Modify `packages/db/prisma/schema.prisma`

**Step 1:** Ajouter les enums (après `enum TestimonialStatus { … }`).
```prisma
enum EventVisibility { PUBLIC PRIVATE }
enum EventStatus { DRAFT SCHEDULED PUBLISHED }
enum MediaKind { IMAGE VIDEO EMBED }
enum AppointmentStatus { PENDING CONFIRMED DECLINED CANCELLED }
enum AppointmentSource { CONTACT CHATBOT MANUAL }
```

**Step 2:** `ArticleStatus` : ajouter `SCHEDULED` entre `DRAFT` et `PUBLISHED`.

**Step 3:** `MediaAsset` : passer `width`/`height` en optionnels et ajouter
`kind MediaKind @default(IMAGE)`, `durationSec Int?`, `provider String?`,
`externalUrl String?`, `posterUrl String?`. Ajouter back-relations
`eventCovers Event[] @relation("EventCover")`, `eventMedia EventMedia[] @relation("EventMedia")`,
`articleMedia ArticleMedia[] @relation("ArticleMedia")`.

**Step 4:** `Article` : ajouter `scheduledAt DateTime?` (après `publishedAt`),
puis le lien évènement + galerie :
```prisma
  eventId String?        @unique
  event   Event?         @relation("ArticleFromEvent", fields: [eventId], references: [id], onDelete: SetNull)
  media   ArticleMedia[]
```

**Step 5:** Nouveaux modèles (dans une section « Agenda & médias ») :
```prisma
model Event {
  id              String          @id @default(cuid())
  title           String
  slug            String          @unique
  description     String? // markdown
  startAt         DateTime
  endAt           DateTime?
  timezone        String?
  locationName    String?
  address         String?
  city            String?
  isOnline        Boolean         @default(false)
  onlineUrl       String?
  registrationUrl String? // lien d'inscription externe (tiers)
  visibility      EventVisibility @default(PUBLIC)
  status          EventStatus     @default(DRAFT)
  scheduledAt     DateTime?
  publishedAt     DateTime?
  coverId         String?
  cover           MediaAsset?     @relation("EventCover", fields: [coverId], references: [id], onDelete: SetNull)
  media           EventMedia[]
  article         Article?        @relation("ArticleFromEvent")
  appointments    AppointmentRequest[] @relation("AppointmentEvent")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  @@index([startAt])
  @@index([status, startAt])
}

model EventMedia {
  id      String @id @default(cuid())
  order   Int    @default(0)
  eventId String
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  mediaId String
  media   MediaAsset @relation("EventMedia", fields: [mediaId], references: [id], onDelete: Cascade)
  @@index([eventId])
}

model ArticleMedia {
  id        String @id @default(cuid())
  order     Int    @default(0)
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  mediaId   String
  media     MediaAsset @relation("ArticleMedia", fields: [mediaId], references: [id], onDelete: Cascade)
  @@index([articleId])
}

model AppointmentRequest {
  id          String            @id @default(cuid())
  name        String
  email       String
  topic       String?
  message     String?
  requestedAt DateTime? // créneau souhaité
  durationMin Int?
  status      AppointmentStatus @default(PENDING)
  source      AppointmentSource @default(CONTACT)
  ip          String?
  userAgent   String?
  eventId     String?
  event       Event?            @relation("AppointmentEvent", fields: [eventId], references: [id], onDelete: SetNull)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  @@index([status, requestedAt])
}
```

**Step 6:** Valider.
Run: `pnpm --filter @portfolio/db exec prisma validate` → *valid 🚀*.

**Step 7:** Commit (schéma seul).
```bash
git add packages/db/prisma/schema.prisma
git commit -m "feat(db): agenda/events, video media, scheduled articles, appointments"
```

---

### Task 3: Migration + grants de moindre privilège

**Files:** Create `packages/db/prisma/migrations/<ts>_agenda_media_scheduling/migration.sql`

**Step 1:** Générer sans appliquer.
```bash
set -a; . ./.env; set +a
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5436/${POSTGRES_DB}?schema=public"
pnpm --filter @portfolio/db exec prisma migrate dev --create-only --name agenda_media_scheduling
```

**Step 2:** Ajouter le bloc sécurité en fin de `migration.sql` (RDV = soumission
publique, jamais lisible côté web ; comme `ContactMessage`).
```sql
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    -- Demandes de RDV : le public peut soumettre, jamais lire.
    REVOKE ALL PRIVILEGES ON TABLE "AppointmentRequest" FROM app_web;
    GRANT INSERT ON TABLE "AppointmentRequest" TO app_web;
  END IF;
END $$;
```
> Les tables `Event`, `EventMedia`, `ArticleMedia` restent en SELECT public (default privileges) — le filtrage `status=PUBLISHED`/`visibility` est fait par l'app `web`.

**Step 3:** Appliquer + régénérer.
```bash
pnpm --filter @portfolio/db exec prisma migrate dev   # applique
pnpm --filter @portfolio/db exec prisma generate
```
Expected: migration appliquée, client régénéré (contient `event`, `appointmentRequest`).

**Step 4:** Déployer aussi sur le schéma `test`.
Run: `pnpm --filter @portfolio/db db:test:deploy`

**Step 5:** Commit.
```bash
git add packages/db/prisma/migrations
git commit -m "feat(db): agenda/appointments migration with least-privilege grants"
```

---

### Task 4: Seed d'un évènement + actu liée

**Files:** Modify `packages/db/prisma/seed-content.ts`

**Step 1:** Dans le reset, ajouter `await prisma.event.deleteMany();` (avant les
créations). Puis créer un évènement public + une actu programmée :
```ts
const event = await prisma.event.create({
  data: {
    title: "Meetup Dev & Produit", slug: "meetup-dev-produit",
    description: "Rencontre autour du build solo de bout en bout.",
    startAt: new Date("2026-09-15T18:30:00Z"),
    locationName: "La Plage Digitale", city: "Lille",
    registrationUrl: "https://example.com/inscription",
    visibility: "PUBLIC", status: "PUBLISHED", publishedAt: new Date(),
  },
});
await prisma.article.create({
  data: {
    title: "Je serai au Meetup Dev & Produit", slug: "actu-meetup",
    excerpt: "Rendez-vous le 15 septembre à Lille.",
    content: "Venez échanger sur le build produit de bout en bout.",
    status: "SCHEDULED", scheduledAt: new Date("2026-09-01T08:00:00Z"),
    eventId: event.id,
  },
});
```

**Step 2:** Lancer le seed.
```bash
pnpm --filter @portfolio/db exec tsx prisma/seed-content.ts
```
Expected: log de fin sans erreur.

**Step 3:** Commit.
```bash
git add packages/db/prisma/seed-content.ts
git commit -m "test(db): seed a sample event and scheduled article"
```

---

### Task 5: Test d'intégration — sécurité RDV + actu programmée masquée

**Files:** Create `packages/db/src/testing/agenda.test.ts`

**Step 1: Write the failing test**
```ts
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "./db";
import { resetDb } from "./reset";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("une actu SCHEDULED n'est pas listée comme publiée", async () => {
  await prisma.article.create({ data: { title: "x", slug: "x", excerpt: "e", content: "c", status: "SCHEDULED", scheduledAt: new Date(Date.now() + 3_600_000) } });
  const published = await prisma.article.findMany({ where: { status: "PUBLISHED" } });
  expect(published).toHaveLength(0);
});

test("un évènement public PUBLISHED est requêtable", async () => {
  await prisma.event.create({ data: { title: "e", slug: "e", startAt: new Date(), status: "PUBLISHED", visibility: "PUBLIC" } });
  const list = await prisma.event.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC" } });
  expect(list).toHaveLength(1);
});
```

**Step 2:** Run: `pnpm --filter @portfolio/db exec dotenv -e ../../.env.test -- vitest run src/testing/agenda.test.ts`
Expected: PASS (modèles présents après `db:test:deploy`).

> Test du grant RDV (`app_web` ne peut pas SELECT `AppointmentRequest`) : couvert
> en P6/P13 via une connexion au rôle `app_web` (hors périmètre du client owner ici).

**Step 3:** Commit.
```bash
git add packages/db/src/testing/agenda.test.ts
git commit -m "test(db): scheduled article hidden + public event queryable"
```

---

## Definition of Done (P1)

- Logique de publication programmée testée (unit).
- Schéma migré (Event/EventMedia/ArticleMedia/AppointmentRequest, média vidéo,
  `Article.scheduledAt` + lien évènement) sur `public` **et** `test`.
- Grant : `app_web` peut INSÉRER une demande de RDV, jamais la lire.
- Seed d'un évènement + actu programmée OK.
- `prisma validate` vert, client régénéré.
