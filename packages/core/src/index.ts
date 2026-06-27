/**
 * Shared types & utilities for the portfolio monorepo.
 *
 * Placeholder export — real shared logic (webp helpers, domain types) lands
 * with the dedicated features.
 */

/** Public sections exposed by the portfolio site. */
export type PortfolioSection = "cv" | "projects" | "newsletter";

/** Identifies the running app within the monorepo. */
export type AppName = "web" | "admin";
