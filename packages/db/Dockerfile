# syntax=docker/dockerfile:1
# One-shot migration runner — applies pending Prisma migrations to the DB on
# every `docker compose up`, BEFORE web/admin start, so the schema and the
# database can never drift (no manual `migrate deploy` to remember).
#
# Runs as the DB owner role (POSTGRES_USER): migrations need DDL privileges that
# the least-privilege app roles (app_web / app_admin) intentionally lack.
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
# NB: deliberately NOT installing OpenSSL. On `internal` (no Internet), a detected
# OpenSSL 3.x makes Prisma try to *download* its matching engine at runtime, which
# fails. Without it, Prisma uses its bundled engine — migrate deploy works offline.

WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter "@portfolio/db..." --frozen-lockfile

WORKDIR /repo/packages/db
# `migrate deploy` applies committed migrations only (never generates/resets) —
# safe and idempotent: a no-op when the database is already up to date.
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
