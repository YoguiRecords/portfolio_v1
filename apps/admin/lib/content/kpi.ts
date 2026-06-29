import type { PrismaClient } from "@portfolio/db";
import { KpiInput, ReorderItem } from "@portfolio/core";

/**
 * KPI persistence (write side, `app_admin`). Each function validates its input
 * with Zod and is injected with a Prisma client so it can be unit-tested on the
 * isolated test database. The thin Server Actions wrap these with the shared
 * client + auth guard.
 */

/** Lists KPIs ordered for the editor. */
export function listKpis(prisma: PrismaClient) {
  return prisma.kpi.findMany({ orderBy: { order: "asc" } });
}

/** Creates a KPI from validated input. */
export async function createKpi(prisma: PrismaClient, raw: unknown) {
  const data = KpiInput.parse(raw);
  return prisma.kpi.create({ data });
}

/** Updates a KPI by id. */
export async function updateKpi(prisma: PrismaClient, id: string, raw: unknown) {
  const data = KpiInput.parse(raw);
  return prisma.kpi.update({ where: { id }, data });
}

/** Deletes a KPI by id. */
export async function deleteKpi(prisma: PrismaClient, id: string) {
  await prisma.kpi.delete({ where: { id } });
}

/** Persists a new ordering for a set of KPIs. */
export async function reorderKpis(prisma: PrismaClient, raw: unknown) {
  const items = ReorderItem.array().parse(raw);
  await prisma.$transaction(
    items.map((it) => prisma.kpi.update({ where: { id: it.id }, data: { order: it.order } })),
  );
}
