/**
 * Shared Prisma client for the portfolio monorepo (Prisma 7 + driver adapter).
 *
 * The generated client lives in `../generated/prisma` (git-ignored) — run
 * `pnpm --filter @portfolio/db db:generate` after cloning or schema changes.
 *
 * A single PrismaClient instance is reused across hot reloads in development
 * to avoid exhausting database connections.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Extracts the `schema` query parameter from a Postgres URL (defaults to `public`). */
function schemaFromUrl(url: string | undefined): string {
  if (!url) return "public";
  try {
    return new URL(url).searchParams.get("schema") ?? "public";
  } catch {
    return "public";
  }
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  // The pg driver adapter ignores the URL `?schema=` param, so it is parsed and
  // passed explicitly — otherwise every query would silently hit `public`
  // (breaks tests that point at the isolated `test` schema).
  const adapter = new PrismaPg({ connectionString }, { schema: schemaFromUrl(connectionString) });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../generated/prisma/client";
