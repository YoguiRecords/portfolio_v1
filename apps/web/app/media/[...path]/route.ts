/**
 * Same-origin media passthrough for LOCAL/dev serving. In production Caddy
 * routes `/media/*` straight to MinIO before Next ever sees the request; this
 * handler only serves the same path when the app is reached directly (dev
 * servers, containers without the proxy), streaming the object from MinIO.
 */
const MINIO_INTERNAL = (process.env.MEDIA_INTERNAL_BASE_URL ?? "http://localhost:9100/media").replace(/\/$/, "");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  const object = path.map(encodeURIComponent).join("/");
  const upstream = await fetch(`${MINIO_INTERNAL}/${object}`);
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": upstream.headers.get("cache-control") ?? "public, max-age=31536000, immutable",
    },
  });
}
