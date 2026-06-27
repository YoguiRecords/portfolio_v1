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
    pnpm install --filter @portfolio/converter... --frozen-lockfile
RUN pnpm --filter @portfolio/converter build
# Produit un dossier autonome (node_modules prod aplati) copiable tel quel.
# `--legacy` : converter n'a pas de dépendance workspace injectée (pnpm 10+ l'exige).
RUN pnpm --filter @portfolio/converter deploy --prod --legacy /app

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5050
COPY --from=build /app ./
USER node
EXPOSE 5050
CMD ["node", "dist/server.js"]
