import type { PrismaClient } from "../../generated/prisma/client";

/**
 * Truncates every application table in the `test` schema (except the Prisma
 * migrations bookkeeping table), restarting identities and cascading FKs.
 *
 * Called between tests to guarantee isolation without re-running migrations.
 *
 * @param prisma - client bound to the test database (see {@link makeTestClient}).
 */
export async function resetDb(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'test' AND tablename <> '_prisma_migrations'`,
  );
  if (rows.length === 0) return;
  const list = rows.map((r) => `"test"."${r.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}
