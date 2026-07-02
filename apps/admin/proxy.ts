/**
 * Proxy (Next 16 successor to middleware): coarse session gate for the back office.
 *
 * It only checks for the PRESENCE of the session cookie (the edge runtime
 * cannot reach the database). The real validity check happens server-side in
 * the protected pages via `getCurrentSession()` — a forged or expired cookie
 * passes here but is rejected there.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Paths reachable without a session. These internal surfaces carry no BO session
 * (they are called machine-to-machine on the Docker `internal` network, never
 * routed by Caddy) and are protected instead by their own shared-secret tokens:
 * - `/internal/*`   : the CV document printed by `cv-renderer` (`CV_RENDER_TOKEN`).
 * - `/api/internal/*`: the booking API called by `web` (`APPOINTMENTS_INTERNAL_TOKEN`).
 */
const PUBLIC_PATHS = ["/login", "/internal", "/api/internal", "/robots.txt"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const publicPath = isPublicPath(pathname);

  // Coarse gate only: redirect unauthenticated requests away from protected
  // paths. The reverse ("already logged in → dashboard") is handled server-side
  // in the /login page, where the session is actually validated — doing it here
  // on cookie presence alone would loop forever for an expired/forged cookie.
  if (!hasSession && !publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // All routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
