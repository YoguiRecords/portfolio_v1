# cv-renderer — internal headless service (Chromium via Playwright) that prints
# the admin CV document to PDF. Pinned to the repo's Playwright version so the
# bundled browser matches the npm package. Hardened: non-root, no extra caps.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

# Browsers are already baked into the base image — skip the postinstall download.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production
ENV PORT=5051

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server.mjs ./

# Durcissement portfolio : conteneur non-root (norme STACK_DOCKER). `pwuser` est
# fourni par l'image Playwright.
RUN chown -R pwuser:pwuser /app
USER pwuser

EXPOSE 5051

CMD ["node", "server.mjs"]
