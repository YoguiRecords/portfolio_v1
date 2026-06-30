import { expect, test } from "@playwright/test";

const ADMIN = "http://localhost:3101";

/**
 * Todo board (`/taches`) E2E.
 *
 * Security first (project principe n°0): the unified task board is a private
 * back-office route and must redirect to /login without an authenticated
 * session — same guard as the other BO v2 routes (see `bo-v2.spec.ts`).
 *
 * The authenticated create/move-across-columns flow is NOT exercised here:
 * the BO login is MFA/TOTP-hardened and no automated login helper exists, so
 * driving a real session in CI is out of reach. That behaviour is covered at
 * the unit/integration level instead:
 *  - `apps/admin/lib/crm/crm.test.ts` — createTask defaults + setTaskStatus
 *    validation (column move).
 *  - `apps/admin/lib/data/mission-control.test.ts` — "today only" task filter.
 */
test("accès /taches sans session → redirige vers /login", async ({ page }) => {
  await page.goto(`${ADMIN}/taches`);
  await expect(page).toHaveURL(/\/login/);
});
