# Friday Booking — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Friday (public AI e-secretary) proposes real free slots (Mon–Sat 9h–20h, 30-min on the hour, minus Outlook + booked RDV + declared unavailabilities), collects the visitor's identity via an in-chat form, creates a RDV request that blocks the slot immediately (even PENDING), notifies by email, and supports self-service cancellation. Yohan validates/declines/cancels in the BO and declares holidays.

**Architecture:** Availability + booking logic is centralised in `apps/admin` (which owns write DB access + the composite calendar with Microsoft Graph). `apps/web` (read-only `app_web` role) never reads private RDV/calendar data — it calls token-guarded **internal** admin routes over the Docker `internal` network (pattern reused from `cv-renderer`). Free-slot computation is a pure, tested function in `packages/core`.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Prisma/PostgreSQL 16, Zod, Vitest, Playwright, Microsoft Graph (email + calendar), Tailwind v4.

**Reference design:** `docs/plans/2026-07-01-friday-booking-design.md`.

**Git:** work on `llm`, atomic commits (Conventional Commits, scopes `db|core|admin|web|docker|docs`), green tests after each. No push/PR until the whole feature is validated in a real browser.

---

## Conventions used in this plan

- Run a single Vitest file: `pnpm --filter <pkg> test -- <path>` (pkg = `@portfolio/core` | `admin` | `web`). Prefer `rtk vitest run` per RTK rules.
- Prisma client regen after schema change: `pnpm --filter @portfolio/db generate`.
- Migration name format: `YYYYMMDDHHMMSS_short_name` under `packages/db/prisma/migrations/`.
- After any shared-package change or Prisma regen, **restart the dev server** before browser validation (stale client caveat, cf. STACK_TESTING).

---

## Phase 0 — Data model (Prisma)

### Task 0.1: Extend `AppointmentRequest` + add `Unavailability`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `AppointmentRequest` ~L922; add enum-free model `Unavailability`)

**Step 1: Edit the schema**

Add to `AppointmentRequest` (after `email`):
```prisma
  firstName   String?
  lastName    String?
  phone       String?
  cancelToken String? @unique
```
Add new model near `AppointmentRequest`:
```prisma
/// Indisponibilité déclarée au BO (vacances, blocage ponctuel). Bloque tous les
/// créneaux chevauchant [startAt, endAt]. Donnée PRIVÉE : `app_web` n'y accède
/// jamais (REVOKE ALL dans la migration).
model Unavailability {
  id        String   @id @default(cuid())
  startAt   DateTime
  endAt     DateTime
  reason    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([startAt, endAt])
}
```

**Step 2: Create the migration SQL**

Create `packages/db/prisma/migrations/<ts>_friday_booking/migration.sql`:
```sql
-- AppointmentRequest: identity + cancel token
ALTER TABLE "AppointmentRequest"
  ADD COLUMN "firstName"   TEXT,
  ADD COLUMN "lastName"    TEXT,
  ADD COLUMN "phone"       TEXT,
  ADD COLUMN "cancelToken" TEXT;
CREATE UNIQUE INDEX "AppointmentRequest_cancelToken_key"
  ON "AppointmentRequest" ("cancelToken");

-- Anti double-booking: at most one active RDV per slot start.
CREATE UNIQUE INDEX "AppointmentRequest_active_slot_key"
  ON "AppointmentRequest" ("requestedAt")
  WHERE "status" IN ('PENDING','CONFIRMED') AND "requestedAt" IS NOT NULL;

-- Unavailability (private, admin only)
CREATE TABLE "Unavailability" (
  "id"        TEXT NOT NULL,
  "startAt"   TIMESTAMP(3) NOT NULL,
  "endAt"     TIMESTAMP(3) NOT NULL,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Unavailability_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Unavailability_startAt_endAt_idx" ON "Unavailability" ("startAt","endAt");
REVOKE ALL ON "Unavailability" FROM "app_web";

-- Booking now goes through admin only: drop web's direct INSERT on RDV.
REVOKE INSERT ON "AppointmentRequest" FROM "app_web";
```

**Step 3: Apply + regen**

Run: `docker compose up -d db` then `pnpm --filter @portfolio/db exec prisma migrate deploy` (local dev DB), then `pnpm --filter @portfolio/db generate`.
Expected: migration applied, client regenerated, no error.

> ⚠️ `REVOKE INSERT ... app_web` on `AppointmentRequest` breaks the current public
> `POST /api/appointments` (contact form) which inserts directly. Task 7.2 re-routes it
> through admin **before** this is user-visible; keep both tasks in the same delivery.

**Step 4: Commit**
```
git add packages/db/prisma
git commit -m "feat(db): appointment identity + cancel token + Unavailability, revoke web insert"
```

---

## Phase 1 — Core: availability computation (pure, TDD)

### Task 1.1: Availability constants + `computeFreeSlots`

**Files:**
- Create: `packages/core/src/booking/availability.ts`
- Test: `packages/core/src/booking/availability.test.ts`
- Modify: `packages/core/src/index.ts` (export)

**Step 1: Write failing tests**

`availability.test.ts` (AAA):
```ts
import { describe, it, expect } from "vitest";
import { computeFreeSlots, DEFAULT_AVAILABILITY } from "./availability";

const at = (iso: string) => new Date(iso);

describe("computeFreeSlots", () => {
  it("generates 30-min slots on the hour, 9h→20h, for a working day (Mon)", () => {
    // 2026-07-06 is a Monday
    const slots = computeFreeSlots({
      from: at("2026-07-06T00:00:00Z"),
      to: at("2026-07-06T23:59:59Z"),
      busy: [],
      unavailabilities: [],
      now: at("2026-07-01T00:00:00Z"),
      config: DEFAULT_AVAILABILITY,
    });
    // 9,10,11,12,13,14,15,16,17,18,19 → 11 slots
    expect(slots).toHaveLength(11);
    expect(slots[0].start.getUTCHours()).toBe(9);
    expect(slots.at(-1)!.start.getUTCHours()).toBe(19);
  });

  it("excludes Sunday entirely", () => {
    // 2026-07-05 is a Sunday
    const slots = computeFreeSlots({
      from: at("2026-07-05T00:00:00Z"),
      to: at("2026-07-05T23:59:59Z"),
      busy: [], unavailabilities: [], now: at("2026-07-01T00:00:00Z"),
      config: DEFAULT_AVAILABILITY,
    });
    expect(slots).toHaveLength(0);
  });

  it("removes slots overlapping a busy event", () => {
    const slots = computeFreeSlots({
      from: at("2026-07-06T00:00:00Z"), to: at("2026-07-06T23:59:59Z"),
      busy: [{ start: at("2026-07-06T10:00:00Z"), end: at("2026-07-06T10:30:00Z") }],
      unavailabilities: [], now: at("2026-07-01T00:00:00Z"), config: DEFAULT_AVAILABILITY,
    });
    expect(slots.some((s) => s.start.getUTCHours() === 10)).toBe(false);
    expect(slots.some((s) => s.start.getUTCHours() === 9)).toBe(true);
  });

  it("removes slots inside an unavailability range", () => {
    const slots = computeFreeSlots({
      from: at("2026-07-06T00:00:00Z"), to: at("2026-07-06T23:59:59Z"),
      busy: [],
      unavailabilities: [{ start: at("2026-07-06T00:00:00Z"), end: at("2026-07-07T00:00:00Z") }],
      now: at("2026-07-01T00:00:00Z"), config: DEFAULT_AVAILABILITY,
    });
    expect(slots).toHaveLength(0);
  });

  it("never returns past slots", () => {
    const slots = computeFreeSlots({
      from: at("2026-07-06T00:00:00Z"), to: at("2026-07-06T23:59:59Z"),
      busy: [], unavailabilities: [],
      now: at("2026-07-06T15:30:00Z"), config: DEFAULT_AVAILABILITY,
    });
    expect(slots.every((s) => s.start.getTime() >= at("2026-07-06T15:30:00Z").getTime())).toBe(true);
    expect(slots.some((s) => s.start.getUTCHours() === 16)).toBe(true);
  });

  it("treats an event partially overlapping a slot as busy", () => {
    const slots = computeFreeSlots({
      from: at("2026-07-06T00:00:00Z"), to: at("2026-07-06T23:59:59Z"),
      busy: [{ start: at("2026-07-06T10:15:00Z"), end: at("2026-07-06T11:15:00Z") }],
      unavailabilities: [], now: at("2026-07-01T00:00:00Z"), config: DEFAULT_AVAILABILITY,
    });
    expect(slots.some((s) => s.start.getUTCHours() === 10)).toBe(false);
    expect(slots.some((s) => s.start.getUTCHours() === 11)).toBe(false); // 11:00-11:30 overlaps 11:15
  });
});
```

**Step 2: Run → fail**
Run: `pnpm --filter @portfolio/core test -- src/booking/availability.test.ts`
Expected: FAIL (module not found).

**Step 3: Implement**

`availability.ts`:
```ts
/** A busy interval blocking a slot (calendar event, RDV, unavailability). */
export interface BusyInterval {
  start: Date;
  end: Date;
}

/** A bookable time slot. */
export interface Slot {
  start: Date;
  end: Date;
}

/** Default working-hours config: Mon–Sat, 9h→20h, 30-min slots on the hour. */
export interface AvailabilityConfig {
  /** Weekdays open for booking. 0 = Sunday … 6 = Saturday. */
  weekdays: number[];
  /** First slot start hour (inclusive), local/UTC per `startAt` semantics. */
  startHour: number;
  /** Last slot must END by this hour (exclusive upper bound on start+duration). */
  endHour: number;
  /** Slot length in minutes. */
  durationMin: number;
}

export const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  weekdays: [1, 2, 3, 4, 5, 6], // Mon–Sat (Sunday off)
  startHour: 9,
  endHour: 20,
  durationMin: 30,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function overlaps(a: Slot, b: BusyInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Computes free bookable slots in [from, to], honouring the working-hours config,
 * removing any slot overlapping a busy interval or an unavailability, and never
 * returning a slot starting before `now`. Pure & deterministic (no `Date.now()`).
 *
 * NOTE: hour math uses UTC (`getUTCHours`/`setUTCHours`) for testability. The
 * caller passes a config whose hours are interpreted in the same UTC frame; the
 * BO/site run in Europe/Paris — revisit if DST-correct local hours are required.
 */
export function computeFreeSlots(input: {
  from: Date;
  to: Date;
  busy: BusyInterval[];
  unavailabilities: BusyInterval[];
  now: Date;
  config: AvailabilityConfig;
}): Slot[] {
  const { from, to, busy, unavailabilities, now, config } = input;
  const blockers = [...busy, ...unavailabilities];
  const slots: Slot[] = [];

  const dayCursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (; dayCursor.getTime() <= to.getTime(); dayCursor.setTime(dayCursor.getTime() + MS_PER_DAY)) {
    if (!config.weekdays.includes(dayCursor.getUTCDay())) continue;
    for (let h = config.startHour; ; h += 1) {
      const start = new Date(dayCursor);
      start.setUTCHours(h, 0, 0, 0);
      const end = new Date(start.getTime() + config.durationMin * 60_000);
      if (end.getUTCHours() > config.endHour || (end.getUTCHours() === config.endHour && end.getUTCMinutes() > 0)) break;
      if (start.getUTCHours() + config.durationMin / 60 > config.endHour) break;
      if (start < now || start < from || end > to) continue;
      const slot = { start, end };
      if (blockers.some((b) => overlaps(slot, b))) continue;
      slots.push(slot);
    }
  }
  return slots;
}
```
> Keep the loop bound simple: iterate `h` from `startHour` while `start + duration ≤ endHour`. Adjust the break condition to match the "9…19 start, 20:00 last end" expectation (11 slots).

**Step 4: Run → pass**
Run: `pnpm --filter @portfolio/core test -- src/booking/availability.test.ts`
Expected: PASS (all 6).

**Step 5: Export + commit**
Add to `packages/core/src/index.ts`:
```ts
// Booking (availability computation)
export {
  computeFreeSlots,
  DEFAULT_AVAILABILITY,
  type AvailabilityConfig,
  type BusyInterval,
  type Slot,
} from "./booking/availability";
```
```
git add packages/core/src/booking packages/core/src/index.ts
git commit -m "feat(core): computeFreeSlots + default availability (Mon-Sat 9-20h)"
```

### Task 1.2: Booking input schema + cancel-token generator

**Files:**
- Modify: `packages/core/src/contact/schema.ts` (add `BookingInput`)
- Test: `packages/core/src/contact/schema.test.ts`
- Reuse: `packages/core/src/auth/token.ts` (`generateSessionToken`) for the cancel token — no new util.
- Modify: `packages/core/src/index.ts` (export `BookingInput`)

**Step 1: Write failing tests** — valid payload passes; missing phone/firstName/email fails; unknown keys stripped.
```ts
import { BookingInput } from "./schema";
it("accepts a complete booking", () => {
  const r = BookingInput.safeParse({
    firstName: "Marc", lastName: "Durand", email: "m@d.fr",
    phone: "+33612345678", reason: "Projet web", requestedAt: "2026-07-06T10:00:00Z",
  });
  expect(r.success).toBe(true);
});
it("rejects a missing phone", () => {
  const r = BookingInput.safeParse({ firstName: "Marc", lastName: "Durand", email: "m@d.fr", reason: "x", requestedAt: "2026-07-06T10:00:00Z" });
  expect(r.success).toBe(false);
});
```

**Step 2: Run → fail.**

**Step 3: Implement** in `schema.ts`:
```ts
/** Booking via the chatbot form: identity + phone + reason + chosen slot. */
export const BookingInput = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(120),
  phone: z.string().min(6).max(30),
  reason: z.string().min(3).max(300),
  requestedAt: z.coerce.date(),
});
export type BookingInput = z.infer<typeof BookingInput>;
```

**Step 4: Run → pass. Export in index.ts. Step 5: Commit**
```
git commit -am "feat(core): BookingInput schema (identity + phone + reason + slot)"
```

---

## Phase 2 — Admin: availability service

### Task 2.1: Include PENDING RDV in `DbCalendar`

**Files:**
- Modify: `apps/admin/lib/integrations/db-calendar.ts:24-29` (appointment `where`)
- Test: `apps/admin/lib/integrations/db-calendar.test.ts`

**Step 1:** add a test asserting a `PENDING` appointment with `requestedAt` in range appears in `listEvents`.
**Step 2:** run → fail. **Step 3:** change `where: { status: "CONFIRMED", ... }` to `where: { status: { in: ["PENDING", "CONFIRMED"] }, ... }`. Keep `kind: "appointment"`.
**Step 4:** run → pass. **Step 5:** commit `fix(admin): block pending RDV slots in DB calendar`.

### Task 2.2: Availability service (admin)

**Files:**
- Create: `apps/admin/lib/booking/availability-service.ts`
- Test: `apps/admin/lib/booking/availability-service.test.ts`

**Step 1: Write failing test** — inject a fake `CalendarProvider` returning one busy event + a prisma stub for `unavailability.findMany`; assert the busy hour is absent from returned ISO slots.

**Step 3: Implement**
```ts
import type { PrismaClient } from "@portfolio/db";
import type { CalendarProvider } from "@portfolio/core/integrations";
import { computeFreeSlots, DEFAULT_AVAILABILITY } from "@portfolio/core";

/** Returns free bookable slots (ISO strings) for [from, to], from the composite
 *  calendar (RDV pending+confirmed, events, Outlook) minus declared unavailabilities. */
export async function listFreeSlots(
  prisma: PrismaClient,
  calendar: CalendarProvider,
  fromIso: string,
  toIso: string,
  now = new Date(),
): Promise<string[]> {
  const [events, offs] = await Promise.all([
    calendar.listEvents(fromIso, toIso),
    prisma.unavailability.findMany({
      where: { startAt: { lte: new Date(toIso) }, endAt: { gte: new Date(fromIso) } },
    }),
  ]);
  const slots = computeFreeSlots({
    from: new Date(fromIso),
    to: new Date(toIso),
    busy: events.map((e) => ({ start: new Date(e.start), end: new Date(e.end) })),
    unavailabilities: offs.map((o) => ({ start: o.startAt, end: o.endAt })),
    now,
    config: DEFAULT_AVAILABILITY,
  });
  return slots.map((s) => s.start.toISOString());
}
```
**Step 4:** run → pass. **Step 5:** commit `feat(admin): free-slot availability service`.

---

## Phase 3 — Admin: internal token-guarded API

### Task 3.1: Internal token guard helper

**Files:**
- Create: `apps/admin/lib/internal/guard.ts`
- Test: `apps/admin/lib/internal/guard.test.ts`

**Step 3: Implement** (constant-time-ish compare; env `APPOINTMENTS_INTERNAL_TOKEN`):
```ts
/** True if the request carries the shared internal token (web → admin calls). */
export function isInternalAuthorized(request: Request): boolean {
  const expected = process.env.APPOINTMENTS_INTERNAL_TOKEN;
  if (!expected) return false; // fail closed
  const got = request.headers.get("x-internal-token");
  return !!got && got === expected;
}
```
Test: missing env → false; wrong token → false; correct → true. Commit `feat(admin): internal token guard`.

### Task 3.2: `GET /api/internal/availability`

**Files:**
- Create: `apps/admin/app/api/internal/availability/route.ts`
- Test: `apps/admin/app/api/internal/availability/route.test.ts`

**Implement:** guard → parse `from`/`to` (default: now → now+14d, clamp max 31d) → `listFreeSlots(prisma, getCalendar(), from, to)` → `Response.json({ slots })`. 401 when unauthorized. `export const dynamic = "force-dynamic"`.
Test: unauthorized → 401; authorized → `{ slots: string[] }` (mock `getCalendar`/prisma). Commit.

### Task 3.3: Email helpers (booking lifecycle)

**Files:**
- Create: `apps/admin/lib/booking/emails.ts`
- Test: `apps/admin/lib/booking/emails.test.ts`

**Implement** pure builders returning `SendMailInput` (subject/body text), + a `sendBookingEmail(mailbox, input)` best-effort wrapper (try/catch, log, never throw). Base cancel URL from `process.env.NEXT_PUBLIC_SITE_URL` + `/rdv/annuler?token=`.
```ts
import type { Mailbox, SendMailInput } from "@portfolio/core/integrations";

export function requestReceivedEmail(a: { firstName: string; email: string; whenLabel: string; cancelUrl: string }): SendMailInput { /* text body */ }
export function confirmedEmail(a: { firstName: string; email: string; whenLabel: string; joinInfo: string; cancelUrl: string }): SendMailInput { /* ... */ }
export function cancelledEmail(a: { firstName: string; email: string; whenLabel: string }): SendMailInput { /* ... */ }

export async function sendBookingEmail(mailbox: Mailbox, input: SendMailInput): Promise<void> {
  try { await mailbox.sendMessage(input); }
  catch (e) { console.error("[booking] email skipped:", e); }
}
```
Test the builders' subject/body content + that `sendBookingEmail` swallows a throwing mailbox. Commit.

### Task 3.4: `POST /api/internal/appointments` (create, atomic)

**Files:**
- Create: `apps/admin/lib/booking/create-appointment.ts`
- Create: `apps/admin/app/api/internal/appointments/route.ts`
- Test: `apps/admin/lib/booking/create-appointment.test.ts`

**Implement `createAppointment(prisma, calendar, mailbox, input)`:**
1. `BookingInput.parse(input)`.
2. Re-check the slot is still free: `listFreeSlots(prisma, calendar, slotStart, slotEnd)` includes `requestedAt` → else throw `slot_taken`.
3. `cancelToken = generateSessionToken()`.
4. `prisma.appointmentRequest.create({ data: { firstName, lastName, name: \`${firstName} ${lastName}\`, email, phone, topic: reason, requestedAt, durationMin: 30, source: "CHATBOT", cancelToken }, select: { id: true } })`. Catch the partial-unique-index violation (P2002) → throw `slot_taken`.
5. Best-effort `sendBookingEmail(mailbox, requestReceivedEmail(...))`.
6. Return `{ ok: true }`.

Route: guard → `createAppointment(prisma, getCalendar(), getMailbox(), body)` → 201; `slot_taken` → 409; ZodError → 400.
Tests (AAA, mocks): happy path creates PENDING + sends email; taken slot → throws/409; invalid → 400. Commit.

### Task 3.5: `POST /api/internal/appointments/cancel` (by token)

**Files:**
- Create: `apps/admin/lib/booking/cancel-appointment.ts`
- Create: `apps/admin/app/api/internal/appointments/cancel/route.ts`
- Test: `apps/admin/lib/booking/cancel-appointment.test.ts`

**Implement `cancelByToken(prisma, mailbox, token)`:** find PENDING/CONFIRMED appt by `cancelToken`; if none → return `{ ok: false }` (generic, no enumeration); set `status: "CANCELLED"` (frees the slot via the partial index); best-effort `cancelledEmail`. Route: guard → parse `{ token }` → result. Tests: valid token cancels + frees; unknown token → `{ ok: false }`, no throw. Commit.

---

## Phase 4 — Admin: Unavailability CRUD + BO page

### Task 4.1: Service + Zod

**Files:**
- Create: `apps/admin/lib/booking/unavailability.ts`
- Create/Modify: `packages/core/src/booking/schema.ts` → `UnavailabilityInput` (`startAt`,`endAt` coerced dates with `endAt > startAt` refine, `reason` optional) + export
- Test: `apps/admin/lib/booking/unavailability.test.ts` + core schema test

**Implement** `listUnavailabilities`, `createUnavailability`, `deleteUnavailability` (thin Prisma wrappers, parse with Zod). Commit.

### Task 4.2: Server actions + BO page

**Files:**
- Create: `apps/admin/lib/actions/unavailability-actions.ts` (`requireEnrolledSession` guard, `revalidatePath("/disponibilites")`)
- Create: `apps/admin/app/(dashboard)/disponibilites/page.tsx`
- Modify: `apps/admin/components/admin-nav/admin-nav.tsx` (add nav item under "Relation client", icon `calendar`/`agenda`)

**Page:** list current/future unavailabilities (date range + reason + delete confirm) + a create form (`startAt`/`endAt` `datetime-local`, `reason`). Follow the `/agenda` page layout idiom (`PageContainer`, `inputCls`, `Button`, `ConfirmSubmitButton`). Commit `feat(admin): unavailability (holidays) CRUD + BO page`.

---

## Phase 5 — Admin: RDV moderation emails + cancel confirmed + calendar

### Task 5.1: Emails on confirm/decline + cancel a confirmed RDV

**Files:**
- Modify: `apps/admin/lib/content/moderation.ts` (`confirmAppointmentWithEvent`, `declineAppointment`, add `cancelAppointment`)
- Modify: `apps/admin/lib/actions/moderation-actions.ts` (pass `getMailbox()`, add `cancelAppointmentAction`)
- Modify: `apps/admin/components/rdv/rdv-list.tsx` (add "Annuler" on CONFIRMED rows)
- Tests: `apps/admin/lib/content/moderation-appointment.test.ts`

**Implement:**
- `confirmAppointmentWithEvent(prisma, calendar, mailbox, id, joinInfo?)`: after CONFIRMED + calendar event, best-effort `confirmedEmail`. Accept an optional `joinInfo` (meeting link/location) from the confirm form.
- `cancelAppointment(prisma, mailbox, id)`: set CANCELLED (frees slot), best-effort `cancelledEmail`.
- `declineAppointment`: add best-effort email (optional).
- Add a `joinInfo` text input + "Annuler" button (on CONFIRMED) in `rdv-list.tsx`; wire actions.
Tests updated for new mailbox arg (mock). Commit `feat(admin): RDV confirm/decline/cancel emails + cancel confirmed`.

### Task 5.2: Show PENDING + unavailabilities in the calendar

**Files:**
- Modify: `apps/admin/app/(dashboard)/calendrier/page.tsx`

PENDING RDV already surface via Task 2.1 (DbCalendar now lists them). Add unavailabilities as a distinct band: fetch `listUnavailabilities` and render them (e.g. grey full-day markers) in the month grid; extend the legend. Commit `feat(admin): calendar shows pending RDV + unavailabilities`.

---

## Phase 6 — Web: public proxy routes + cancel page

### Task 6.1: Internal client helper (web → admin)

**Files:**
- Create: `apps/web/lib/booking/admin-client.ts`
- Test: `apps/web/lib/booking/admin-client.test.ts` (inject `fetchImpl`)

```ts
const BASE = process.env.ADMIN_INTERNAL_URL ?? "http://admin:3101";
const TOKEN = process.env.APPOINTMENTS_INTERNAL_TOKEN ?? "";
function headers() { return { "content-type": "application/json", "x-internal-token": TOKEN }; }
export async function fetchFreeSlots(from: string, to: string, f = fetch): Promise<string[]> { /* GET */ }
export async function submitBooking(payload: unknown, f = fetch): Promise<{ status: number }> { /* POST */ }
export async function submitCancel(token: string, f = fetch): Promise<{ ok: boolean }> { /* POST */ }
```
Commit.

### Task 6.2: `GET /api/availability` (web proxy)

**Files:**
- Create: `apps/web/app/api/availability/route.ts`
- Test: route test

Rate-limit (reuse `allow`), parse `from`/`to` (defaults now→+14d), `fetchFreeSlots` → `{ slots }`. Never expose PII. Commit.

### Task 6.3: Re-route `POST /api/appointments` through admin

**Files:**
- Modify: `apps/web/app/api/appointments/route.ts`
- Modify: `apps/web/lib/contact/submit.ts` (drop `persistAppointment` direct insert; or keep for contact form only if it still targets a different flow)
- Tests: `apps/web/app/api/chat/route.test.ts` neighbours / appointments route test

Keep rate-limit + honeypot; validate with `BookingInput` (for chatbot) — but the **contact form** currently posts `AppointmentInput` (name/email/topic/message, no phone). Decision: the contact page's "demande de RDV" becomes a lightweight lead (no slot blocking) → keep it posting to a **separate** path that still inserts via admin internal as a `CONTACT` source **without** `requestedAt` (no slot), OR converge on `BookingInput`. Simplest: `POST /api/appointments` forwards the body to `submitBooking` (admin creates + validates). Update the contact form component fields accordingly (add phone) OR route contact leads to the existing contact-message flow. **Resolve during execution; prefer converging the public RDV entry points on the admin internal endpoint.** Commit.

### Task 6.4: Public cancellation page

**Files:**
- Create: `apps/web/app/[locale]/rdv/annuler/page.tsx` (or the web routing convention in use)
- Test: minimal

Reads `?token=`, calls `submitCancel(token)` (server action or route), shows a generic confirmation ("Si un rendez-vous correspondait à ce lien, il a été annulé."). No account enumeration. Commit.

---

## Phase 7 — Web: chat booking form card

### Task 7.1: Booking form component

**Files:**
- Create: `apps/web/components/chat-widget/booking-form.tsx`
- Modify: `apps/web/components/chat-widget/chat-widget.tsx` (render the card on booking intent)
- Modify: `apps/web/components/chat-widget/chat-widget.module.css` (card styles, DA gold/dark)
- Test: `apps/web/components/chat-widget/chat-widget.test.tsx`

**Behaviour:**
- Add a "Prendre rendez-vous" affordance (button in the widget header or a message action). On click → fetch `/api/availability` → render `<BookingForm slots={...} />`.
- `BookingForm`: fields firstName, lastName, email, phone, reason + a `<select>` of free slots (label formatted `fr-FR`). On submit → `POST /api/appointments` with `BookingInput` shape → on success show: **« Merci {prénom} ! Ta demande pour le {créneau} est enregistrée. Yohan la validera dès que possible et tu recevras un email. »**
- Handle 409 (`slot_taken`) → refresh slots + message "ce créneau vient d'être pris". Handle 429/500 gracefully.
- Accessibility + touch targets (mobile) per STACK_TESTING.

Tests: renders fields, submit calls fetch with correct payload, success message shown, slot_taken handled. Commit `feat(web): in-chat booking form with real free slots`.

### Task 7.2: Guide Friday to propose slots

**Files:**
- Modify: `packages/core/src/ai/guardrails.ts` (rule 4: instruct to invite the visitor to use the booking form / "Prendre rendez-vous" button instead of inventing slots)
- Modify: `apps/web/app/api/chat/route.ts` (optionally inject a short note that a booking form exists; do NOT inject private data)
- Modify tests: `packages/core/src/ai/chat.test.ts`

Update the guardrail so Friday **never invents slots**; it points to the booking action. Commit.

### Task 7.3: Remove dead booking tool

**Files:**
- Delete: `apps/web/lib/chat/booking.ts` (+ references in `apps/web/lib/chat/chat.test.ts`)

Confirm nothing else imports `bookingTool`/`bookAppointment` (grep). Commit `chore(web): remove unwired chatbot booking tool`.

---

## Phase 8 — Wiring, env, docs

### Task 8.1: Docker + env

**Files:**
- Modify: `docker-compose.yml` (web service env: `ADMIN_INTERNAL_URL: http://admin:3101`, `APPOINTMENTS_INTERNAL_TOKEN: ${APPOINTMENTS_INTERNAL_TOKEN:-dev-appt-token}`, `NEXT_PUBLIC_SITE_URL`; admin service env: `APPOINTMENTS_INTERNAL_TOKEN`, `NEXT_PUBLIC_SITE_URL`)
- Modify: `.env.example` (document `APPOINTMENTS_INTERNAL_TOKEN`)

No new published port (internal network only). Commit `chore(docker): wire appointments internal token web→admin`.

### Task 8.2: Docs (mandatory before delivery)

**Files:**
- `PROGRESS.md` (state + last delivery)
- `TASKS.md` (remove delivered)
- `docs/patch_notes/patch_note_V0_8.md` (dated entry)
- `docs/technical/ARCHITECTURE.md` (web→admin internal availability/booking flow)
- `docs/technical/SECURITY.md` (app_web INSERT revoked; internal token; cancel token)
- `docs/technical/API_REFERENCE.md` (internal + public routes)

Commit `docs(booking): document Friday booking flow for v0.8.x`.

---

## Phase 9 — Verification (NON-NEGOTIABLE)

### Task 9.1: Full test + typecheck + lint
Run: `rtk vitest run` (core+admin+web), `rtk tsc` per app/pkg, `rtk lint`. All green.

### Task 9.2: E2E
- Create `apps/web/e2e/booking.spec.ts` (widget open → booking form → submit → success) and/or `apps/admin/e2e` guard for `/disponibilites`.

### Task 9.3: Real-browser validation (MCP Playwright)
Per STACK_TESTING & memory [[real-browser-validation-required]]:
1. Enable public chat (`AiAssistantConfig.isPublicChatEnabled`), restart web (stale Prisma client).
2. Web: open Friday → "Prendre rendez-vous" → verify real free slots load → submit a booking → success message. Screenshots **desktop + mobile (~390px)**.
3. BO ([[bo-test-session-minting]]): `/disponibilites` create a holiday range → re-check the slot disappears on the site. `/rdv` accept the booking → confirmed; `/calendrier` shows PENDING + unavailability. Cancel a confirmed RDV → slot frees.
4. Verify a booked (PENDING) slot is no longer offered.
5. UX pass (touch targets, empty states, no overflow) desktop + mobile.
Clean up screenshots (git-ignored / outside repo).

### Task 9.4: Delivery
- Update all impacted docs (Task 8.2). Open PR `llm → dev` only after green CI + real-browser validation; merge per STACK_GIT rule (green + no conflict → auto-merge).

---

## Risks & notes
- **Timezone:** `computeFreeSlots` uses UTC hours for testability; the site is Europe/Paris. If DST-correct local working hours matter, convert config hours to the Paris offset when building day cursors (revisit before prod).
- **Graph off locally:** availability then = window minus RDV/unavailability only; emails are best-effort (logged). Acceptable for dev.
- **Contact form convergence (Task 6.3):** decide whether the existing contact-page RDV entry adopts `BookingInput` (adds phone) or stays a no-slot lead; do not leave `app_web` needing INSERT.
- **Atomicity:** the partial unique index is the real guard against double-booking; the pre-check is UX-only.
```

