import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Image Docker minimale (serveur Node autonome + deps tracées).
  output: "standalone",
  // Monorepo : tracer les dépendances depuis la racine du workspace.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Workspace packages shipped as TypeScript source and transpiled by Next.
  transpilePackages: ["@portfolio/core", "@portfolio/db", "@portfolio/ui"],
};

export default withNextIntl(nextConfig);
