import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration. The connection URL lives here (used by the CLI for
 * migrations) instead of in `schema.prisma`. At runtime the URL is consumed by
 * the driver adapter (see `src/index.ts`).
 *
 * `prisma generate` does not connect to the database, so a placeholder is used
 * when `DATABASE_URL` is absent (CI builds). Real migrations require the env var
 * to be set; otherwise the placeholder host fails fast with a clear error.
 */
const url =
  process.env.DATABASE_URL ?? "postgresql://placeholder@localhost:5432/portfolio?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
