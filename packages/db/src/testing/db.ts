import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * Builds a fresh Prisma client bound to the isolated test database.
 *
 * `DATABASE_URL` must point at the dedicated `test` schema (see `.env.test`)
 * so tests never touch the dev/prod data. Callers own the lifecycle and must
 * `$disconnect()` when done.
 *
 * The `pg` driver adapter ignores the `?schema=` URL parameter (unlike Prisma's
 * native engine), so the schema is parsed from the URL and passed explicitly —
 * otherwise queries would silently run against `public`.
 */
export function makeTestClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const schema = schemaFromUrl(connectionString);
  const adapter = new PrismaPg({ connectionString }, { schema });
  return new PrismaClient({ adapter });
}

/** Extracts the `schema` query parameter from a Postgres URL (defaults to `public`). */
function schemaFromUrl(url: string | undefined): string {
  if (!url) return "public";
  try {
    return new URL(url).searchParams.get("schema") ?? "public";
  } catch {
    return "public";
  }
}
