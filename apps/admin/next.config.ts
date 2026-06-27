import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages are shipped as TypeScript source and transpiled by Next.
  transpilePackages: ["@portfolio/core", "@portfolio/db"],
};

export default nextConfig;
