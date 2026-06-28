/**
 * Auth constants shared by the middleware (edge runtime) and the session
 * service (node runtime). Keep this file free of node-only imports.
 */

/** Name of the httpOnly cookie holding the opaque session token. */
export const SESSION_COOKIE_NAME = "admin_session";

/** Session lifetime in seconds (8 hours) — short-lived for a hardened back office. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
