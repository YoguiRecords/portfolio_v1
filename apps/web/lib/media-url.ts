/**
 * Same-origin mapping for stored media URLs.
 *
 * Uploads store an ABSOLUTE public URL (dev: `http://localhost:9100/media/x`,
 * prod: `https://<domain>/media/x`). Serving the LCP image from another origin
 * costs a full connection handshake on the critical path, so known media URLs
 * are rewritten to the same-origin `/media/<object>` path: served by Caddy in
 * production and by the local `/media/[...path]` route in dev.
 */
const MEDIA_BASE = (process.env.MEDIA_PUBLIC_BASE_URL ?? "http://localhost:9100/media").replace(/\/$/, "");

/**
 * Maps a stored media URL to its same-origin `/media/...` path when it belongs
 * to the configured media base; other URLs pass through untouched.
 */
export function sameOriginMediaUrl(url: string): string {
  if (url.startsWith(`${MEDIA_BASE}/`)) {
    return `/media/${url.slice(MEDIA_BASE.length + 1)}`;
  }
  return url;
}
