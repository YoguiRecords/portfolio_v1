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

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../generated/prisma/client";
