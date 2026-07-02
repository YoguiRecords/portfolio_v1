import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Image Docker minimale (serveur Node autonome + deps tracées).
  output: "standalone",
  // Monorepo : tracer les dépendances depuis la racine du workspace.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Workspace packages shipped as TypeScript source and transpiled by Next.
  transpilePackages: ["@portfolio/core", "@portfolio/db", "@portfolio/ui"],
  experimental: {
    // Inline le CSS dans le HTML : supprime la requête CSS bloquante du chemin
    // critique (même choix que `web`, audit Lighthouse).
    inlineCss: true,
  },
};

export default nextConfig;
