import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * Builds a fresh Prisma client bound to the isolated test database.
 *
 * `DATABASE_URL` must point at the dedicated `test` schema (see `.env.test`)
 * so tests never touch the dev/prod data. Callers own the lifecycle and must
 * `$disconnect()` when done.
 */
export function makeTestClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}
