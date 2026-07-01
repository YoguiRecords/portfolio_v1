/**
 * Whether the dev quick-login shortcut is active. Gated on an explicit runtime
 * flag (never on NODE_ENV: the local Docker image runs a production build, so
 * NODE_ENV is "production" even in local dev). Off unless the flag is exactly
 * "true" — this must never ship as a real auth path in production.
 */
export const isQuickLoginEnabled = (): boolean =>
  process.env.ENABLE_DEV_QUICK_LOGIN === "true";
