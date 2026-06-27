# syntax=docker/dockerfile:1
# Build context = racine du repo (monorepo pnpm). Image finale minimale, non-root.

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter admin... --frozen-lockfile
RUN pnpm --filter admin build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3101
ENV HOSTNAME=0.0.0.0
# Sortie standalone Next (structure monorepo : serveur sous apps/admin/).
COPY --from=build /repo/apps/admin/.next/standalone ./
COPY --from=build /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /repo/apps/admin/public ./apps/admin/public
USER node
EXPOSE 3101
CMD ["node", "apps/admin/server.js"]
